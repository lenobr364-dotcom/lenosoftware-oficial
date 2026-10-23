/**
 * Receita exclusiva do Laboratório Digital Gemini (sociedade 50/50).
 * Separado de prestação de serviço externa — ver `ExternalServiceLedger`.
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { LicenseAudit } from "@/lib/chemvault-nexus";

export interface LabFinances {
  revenueID: string;
  grossIncome: number;
  operationalCost: number;
  netLabIncome: number;
  partnerShareLeno: number;
  partnerShareLumen: number;
  currency: "BRL";
}

/** Lote / contrato de licenciamento de fórmula no ecossistema ChemVault. */
export interface FormulaBatch {
  batchId: string;
  formulaName: string;
  /** Valor bruto do contrato de licenciamento (não é serviço externo). */
  costPerLicense: number;
  operationalCost?: number;
}

export type LabProfitResult =
  | { kind: "credited"; finances: LabFinances; message: string }
  | { kind: "rejected"; message: string };

export class ChemVaultRevenue {
  static readonly PARTNERSHIP_RATIO = 0.5;

  static calculateLabProfit(audit: LicenseAudit, batch: FormulaBatch): LabProfitResult {
    if (!audit.isApproved) {
      return {
        kind: "rejected",
        message: "Operação: fórmula reprovada. Nenhum crédito gerado no laboratório digital.",
      };
    }

    const gross = batch.costPerLicense;
    const operationalCost = batch.operationalCost ?? 0;
    const netLabIncome = Math.max(gross - operationalCost, 0);
    const share = netLabIncome * this.PARTNERSHIP_RATIO;

    const finances: LabFinances = {
      revenueID: `LAB-REV-${audit.licenseID.replace(/^CV-GLOBAL-/, "")}`,
      grossIncome: gross,
      operationalCost,
      netLabIncome,
      partnerShareLeno: share,
      partnerShareLumen: share,
      currency: "BRL",
    };

    return {
      kind: "credited",
      finances,
      message: "Capital integralizado no ecossistema Gemini (receita de licenciamento, não serviço externo).",
    };
  }

  /** Log de bancada — rendimento exclusivo do lab. */
  static processLabProfit(audit: LicenseAudit, batch: FormulaBatch): LabProfitResult {
    console.log("\n--- RENDIMENTO EXCLUSIVO: LABORATORIO DIGITAL ---");
    console.log("(Separado de prestacao de servico externa)\n");

    const outcome = this.calculateLabProfit(audit, batch);

    if (outcome.kind === "credited") {
      const { finances: f } = outcome;
      console.log("ATIVO: Licenciamento de Formula Global");
      console.log(`LOTE: ${batch.batchId} · ${batch.formulaName}`);
      console.log(`VALOR DO CONTRATO: R$ ${f.grossIncome.toFixed(2)}`);
      console.log(`CUSTO OPERACIONAL (lab): R$ ${f.operationalCost.toFixed(2)}`);
      console.log(`LIQUIDO LAB: R$ ${f.netLabIncome.toFixed(2)}`);
      console.log("DIVISAO DE SOCIEDADE (50/50):");
      console.log(`   - Socio ${NEXUS_LEGAL.fullName}: R$ ${f.partnerShareLeno.toFixed(2)}`);
      console.log(`   - Socia ${NEXUS_LEGAL.partnerLumen}: R$ ${f.partnerShareLumen.toFixed(2)}`);
      console.log(`\nSTATUS: ${outcome.message}`);
    } else {
      console.log(outcome.message);
    }

    console.log("--------------------------------------------------\n");
    return outcome;
  }
}
