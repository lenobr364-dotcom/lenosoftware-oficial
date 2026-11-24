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
import { createProposal, getPublicEquipment, listPublicEquipment } from "../lib/comercial/store";

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
  const clean = maskContactText("Lote de Solupan disponível para licenciamento em Barra do Garças.");
  assert.equal(clean.blocked, false);
  assert.equal(clean.changed, false);
  assert.equal(containsBlockedContact(clean.original), false);
}

section("catálogo público não lista manutenção pesada nem britagem");
{
  const list = listPublicEquipment();
  assert.equal(list.length, 0);
  assert.equal(getPublicEquipment("eq-exc-01"), null);
  const missing = createProposal({
    equipmentId: "eq-exc-01",
    locatarioId: "loc-1",
    locatarioDisplayName: "Obra X",
    notes: "Retorno no whatsapp 65999998888 por favor",
    requestedHours: 10,
    estimatedTons: 300,
  });
  assert.equal(missing.ok, false);
  if (missing.ok) throw new Error("fleet equipment must stay out of ChemVault");
  assert.equal(missing.error, "equipment_not_found");
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

section("cálculo detalhado de custo permanece sem catálogo de britagem");
{
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
}

console.log("\nAll comercial anti-disintermediation tests passed.\n");
