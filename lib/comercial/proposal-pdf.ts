import { jsPDF } from "jspdf";

import type { DetailedProposalCostResult } from "@/lib/anti-disintermediation/calculators";
import { EXPECTED_LENO_CNPJ } from "@/lib/anti-disintermediation/exclusivity-terms";
import {
  BRITAGRID_COMMERCIAL_BRAND,
  MARKETPLACE_COMMISSION,
  type CommissionKind,
  calculateCommissionBrl,
} from "@/lib/comercial/plans";
import type { ComercialProposal, PublicEquipment } from "@/lib/comercial/types";

export type ProposalPdfInput = {
  proposal: ComercialProposal;
  equipment: PublicEquipment;
  costs: DetailedProposalCostResult;
  commissionKind: CommissionKind;
  /** Nunca incluir contatos se ainda não liberados. */
  includeContacts: boolean;
};

function money(n: number): string {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

/**
 * Proposta comercial PDF — BritaGrid Brasil / Leno.software.
 * Assinatura discreta com CNPJ; sem contato direto antes do aceite/liberação.
 */
export function buildCommercialProposalPdf(input: ProposalPdfInput): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 18;

  const { proposal, equipment, costs, commissionKind, includeContacts } = input;
  const commission = calculateCommissionBrl(costs.totalBrl, commissionKind);
  const commissionLabel =
    commissionKind === "subscriber"
      ? MARKETPLACE_COMMISSION.subscriberLabel
      : MARKETPLACE_COMMISSION.adHocLabel;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Proposta Comercial", margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`${BRITAGRID_COMMERCIAL_BRAND} · intermediada por Leno.software`, margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.text(`CNPJ ${EXPECTED_LENO_CNPJ} · Pix Santander PJ`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  doc.setDrawColor(180, 140, 40);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. Equipamento", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const eqLines = [
    `Código: ${equipment.codigo} · ${equipment.name}`,
    `Tipo: ${equipment.type} · Região: ${equipment.region}`,
    `Capacidade indicativa: ${equipment.capacityTph} t/h · Tarifa base: ${money(equipment.hourlyRateBrl)}/h`,
    `Locador (exibição): ${equipment.ownerDisplayName}`,
  ];
  for (const line of eqLines) {
    doc.text(line, margin, y);
    y += 5;
  }

  if (includeContacts && equipment.contactReleased) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Contatos liberados (pós-formalização):", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(
      `Tel: ${equipment.phone ?? "—"} · WhatsApp: ${equipment.whatsapp ?? "—"} · E-mail: ${equipment.email ?? "—"}`,
      margin,
      y,
    );
    y += 6;
  } else {
    y += 2;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 20);
    const notice = doc.splitTextToSize(
      "Contatos ocultos até aceite dos termos de exclusividade e pagamento formal (anti-desintermediação). Não utilize canais externos.",
      pageW - margin * 2,
    );
    doc.text(notice, margin, y);
    y += notice.length * 4 + 4;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
  }

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. Escopo da proposta", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Proposta: ${proposal.id} · Status: ${proposal.status}`, margin, y);
  y += 5;
  doc.text(`Horas solicitadas: ${proposal.requestedHours} h · Toneladas est.: ${proposal.estimatedTons} t`, margin, y);
  y += 5;
  const notes = doc.splitTextToSize(`Observações: ${proposal.notes || "—"}`, pageW - margin * 2);
  doc.text(notes, margin, y);
  y += notes.length * 4.5 + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. Memória de cálculo detalhada", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const calcRows: [string, string][] = [
    ["Hora-máquina seca", `${money(costs.dryMachineHourBrl)}/h × ${costs.machineHours} h = ${money(costs.dryMachineTotalBrl)}`],
    [
      `Desgaste por litologia (${costs.lithology}, fator ${costs.wearFactor})`,
      `${money(costs.wearPerHourBrl)}/h → ${money(costs.wearTotalBrl)}`,
    ],
    [
      "Diesel",
      `${costs.dieselLitersPerHour} L/h × ${money(costs.dieselPricePerLiterBrl)}/L × ${costs.machineHours} h = ${money(costs.dieselTotalBrl)}`,
    ],
    ["Mobilização", money(costs.mobilizationBrl)],
    ["Desmobilização", money(costs.demobilizationBrl)],
    ["Subtotal operação", money(costs.subtotalOperationBrl)],
    ["TOTAL da proposta", money(costs.totalBrl)],
    [
      "Custo / tonelada",
      costs.costPerTonBrl == null ? "—" : money(costs.costPerTonBrl),
    ],
    [
      "Hora-máquina carregada",
      costs.costPerMachineHourLoadedBrl == null ? "—" : money(costs.costPerMachineHourLoadedBrl),
    ],
    [`Comissão intermediação (${commissionLabel})`, money(commission)],
  ];

  for (const [label, value] of calcRows) {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 78, y);
    y += 5;
  }

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("4. Condições", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const conditions = doc.splitTextToSize(
    `Negociação exclusiva via ${BRITAGRID_COMMERCIAL_BRAND} / Leno.software. Comissão marketplace: ${MARKETPLACE_COMMISSION.subscriberLabel} para assinantes e ${MARKETPLACE_COMMISSION.adHocLabel} para avulsas. Pagamento Pix Santander PJ (CNPJ ${EXPECTED_LENO_CNPJ}). Contatos só após aceite e formalização.`,
    pageW - margin * 2,
  );
  doc.text(conditions, margin, y);
  y += conditions.length * 4 + 12;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 8;
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(
    `${BRITAGRID_COMMERCIAL_BRAND} / Leno.software · CNPJ ${EXPECTED_LENO_CNPJ} · Barra do Garças-MT`,
    margin,
    y,
  );
  y += 4;
  doc.text("Assinatura discreta da plataforma — documento intermediado; sem canal direto pré-aceite.", margin, y);
  doc.setTextColor(0, 0, 0);

  const out = doc.output("arraybuffer");
  return new Uint8Array(out);
}
