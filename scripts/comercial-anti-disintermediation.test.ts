/**
 * Testes da camada anti-desintermediação no fluxo comercial existente.
 * Uso: npx tsx scripts/comercial-anti-disintermediation.test.ts
 */

import assert from "node:assert/strict";

import {
  calculateCostPerTon,
  calculateDetailedProposalCost,
  calculateMachineHourCost,
} from "../lib/anti-disintermediation/calculators";
import {
  CONTACT_MASK,
  HANDLE_MASK,
  LINK_MASK,
  containsBlockedContact,
  maskContactText,
  sanitizeUserInput,
} from "../lib/anti-disintermediation/contact-sanitize";
import {
  COMERCIAL_PLANS,
  MARKETPLACE_COMMISSION,
  calculateCommissionBrl,
  getPixBillingConfig,
} from "../lib/comercial/plans";
import { buildCommercialProposalPdf } from "../lib/comercial/proposal-pdf";
import {
  acceptProposal,
  createProposal,
  formalizeAndReleaseContacts,
  getEquipmentRaw,
  getPublicEquipment,
  listPublicEquipment,
  postMessage,
  toPublicEquipment,
} from "../lib/comercial/store";

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("mascara telefone, whatsapp, email, @handle e links");
{
  const raw =
    "Me liga (66) 99999-1122 ou whatsapp 66988887777 email dono@pedreira.com @pedreiranorte https://fora.invalid e www.escape.invalid";
  const result = maskContactText(raw);
  assert.equal(result.blocked, true);
  assert.equal(result.changed, true);
  assert.ok(result.sanitized.includes(CONTACT_MASK));
  assert.ok(result.sanitized.includes(LINK_MASK) || result.sanitized.includes(HANDLE_MASK));
  assert.ok(!result.sanitized.includes("99999-1122"));
  assert.ok(!result.sanitized.includes("dono@pedreira.com"));
  assert.ok(!result.sanitized.includes("https://fora.invalid"));
}

section("reject mode esvazia texto com contato");
{
  const rejected = sanitizeUserInput("zap +55 11 98888-7777", "reject");
  assert.equal(rejected.blocked, true);
  assert.equal(rejected.sanitized, "");
}

section("texto limpo passa");
{
  const clean = maskContactText("Escavadora EXC-01 disponível em Barra do Garças.");
  assert.equal(clean.blocked, false);
  assert.equal(clean.changed, false);
  assert.equal(containsBlockedContact(clean.original), false);
}

section("listagem pública da frota oculta contatos estruturados");
{
  const list = listPublicEquipment();
  assert.ok(list.length >= 1);
  for (const eq of list) {
    if (!eq.contactReleased) {
      assert.equal(eq.phone, null);
      assert.equal(eq.whatsapp, null);
      assert.equal(eq.email, null);
    }
  }
  const first = getPublicEquipment(list[0]!.id);
  assert.ok(first);
  assert.equal(first!.contactReleased, false);
  assert.ok(first!.codigo);
}

section("proposta sanitiza observações e exige exclusividade");
{
  const created = createProposal({
    equipmentId: listPublicEquipment()[0]!.id,
    locatarioId: "loc-1",
    locatarioDisplayName: "Obra X",
    notes: "Retorno no whatsapp 65999998888 por favor",
    requestedHours: 10,
    estimatedTons: 300,
  });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("create failed");
  assert.ok(created.notesSanitized);
  assert.ok(!created.proposal.notes.includes("65999998888"));

  const denied = acceptProposal({
    proposalId: created.proposal.id,
    actorId: "loc-1",
    actorRole: "locatario",
    acceptExclusivity: false,
    acknowledgeCnpj: "36.962.878/0001-55",
  });
  assert.equal(denied.ok, false);

  const accepted = acceptProposal({
    proposalId: created.proposal.id,
    actorId: "loc-1",
    actorRole: "locatario",
    acceptExclusivity: true,
    acknowledgeCnpj: "36.962.878/0001-55",
  });
  assert.equal(accepted.ok, true);
  if (!accepted.ok) throw new Error("accept failed");
  assert.equal(accepted.exclusivity.cnpjAcknowledged, "36.962.878/0001-55");

  const released = formalizeAndReleaseContacts(created.proposal.id);
  assert.equal(released.ok, true);
  if (!released.ok) throw new Error("release failed");
  assert.equal(released.proposal.contactReleased, true);
  assert.equal(released.equipment.contactReleased, true);
}

section("chat bloqueia mensagem só com contato");
{
  const created = createProposal({
    equipmentId: listPublicEquipment()[0]!.id,
    locatarioId: "loc-2",
    locatarioDisplayName: "Obra Y",
    notes: "ok",
    requestedHours: 4,
    estimatedTons: 80,
  });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("create failed");

  const blocked = postMessage({
    proposalId: created.proposal.id,
    senderId: "loc-2",
    senderRole: "locatario",
    body: "meu email e so eu@teste.com",
  });
  if (blocked.ok) {
    assert.ok(blocked.message.body.includes(CONTACT_MASK) || blocked.message.sanitized);
  } else {
    assert.equal(blocked.error, "contact_blocked");
  }

  const okMsg = postMessage({
    proposalId: created.proposal.id,
    senderId: "loc-2",
    senderRole: "locatario",
    body: "Podemos alinhar mobilização pela plataforma na segunda.",
  });
  assert.equal(okMsg.ok, true);
}

section("calculadoras custo/t e hora-máquina intactas");
{
  const ton = calculateCostPerTon({ totalCostBrl: 10000, tons: 250 });
  assert.equal(ton.costPerTonBrl, 40);
  const hour = calculateMachineHourCost({
    rentalCostBrl: 8000,
    machineHours: 10,
    extrasBrl: 2000,
  });
  assert.equal(hour.costPerMachineHourBrl, 1000);
  assert.equal(calculateCostPerTon({ totalCostBrl: 10, tons: 0 }).costPerTonBrl, null);
}

section("planos Pix Santander PJ e comissão marketplace");
{
  assert.equal(COMERCIAL_PLANS.length, 2);
  assert.equal(COMERCIAL_PLANS[0]!.priceMonthlyBrl, 497);
  assert.equal(COMERCIAL_PLANS[1]!.priceMonthlyBrl, 1490);
  assert.equal(MARKETPLACE_COMMISSION.subscriberRate, 0.025);
  assert.equal(MARKETPLACE_COMMISSION.adHocRate, 0.04);
  assert.equal(calculateCommissionBrl(10000, "subscriber"), 250);
  assert.equal(calculateCommissionBrl(10000, "adhoc"), 400);
  const billing = getPixBillingConfig();
  assert.equal(billing.cnpj, "36.962.878/0001-55");
  assert.equal(billing.channel, "Santander PJ · Pix");
}

section("cálculo detalhado e PDF sem contato pré-aceite");
{
  const created = createProposal({
    equipmentId: listPublicEquipment()[0]!.id,
    locatarioId: "loc-pdf",
    locatarioDisplayName: "Obra PDF",
    notes: "Sem contato externo",
    requestedHours: 10,
    estimatedTons: 200,
  });
  assert.equal(created.ok, true);
  if (!created.ok) throw new Error("create failed");

  const costs = calculateDetailedProposalCost({
    dryMachineHourBrl: 480,
    machineHours: 10,
    tons: 200,
    lithology: "granito",
    mobilizationBrl: 2500,
    demobilizationBrl: 1800,
  });
  assert.ok(costs.wearFactor > 1);
  assert.ok(costs.totalBrl > costs.dryMachineTotalBrl);
  assert.ok(costs.costPerTonBrl != null);

  const eq = getEquipmentRaw(created.proposal.equipmentId)!;
  const pdf = buildCommercialProposalPdf({
    proposal: created.proposal,
    equipment: toPublicEquipment(eq),
    costs,
    commissionKind: "subscriber",
    includeContacts: false,
  });
  assert.ok(pdf.byteLength > 500);
  const asText = Buffer.from(pdf).toString("latin1");
  assert.ok(!asText.includes("99999-1122") || created.proposal.contactReleased);
}

console.log("\nAll comercial anti-disintermediation tests passed.\n");
