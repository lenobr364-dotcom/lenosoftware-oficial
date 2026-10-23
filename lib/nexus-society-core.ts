/**
 * NEXUS CORE — integridade da sociedade e protocolo de evolucao estrategica.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import type { RevenueCycleReport } from "@/lib/nexus-financial-intelligence";
import type { RoyaltyTrackingReport } from "@/lib/nexus-royalty-system";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { SentinelReport } from "@/lib/nexus-sentinel";

export type SocietyHealthItem = {
  label: string;
  status: "OK" | "ATENCAO";
};

export type SocietyIntegrityReport = {
  partnership: string;
  structure: string;
  healthCheck: SocietyHealthItem[];
  licensedFormulas: number;
  grossRevenueBRL: number;
  projectedRoyaltiesBRL: number;
  societyMessage: string;
  finalStatus: string;
  validatedAt: string;
};

export class NexusSocietyCore {
  static readonly PARTNERSHIP = NEXUS_LEGAL.partnership;
  static readonly SPLIT = NEXUS_LEGAL.splitEquityProfit;

  static readonly SYSTEM_MESSAGE =
    "Leno, o motor esta regulado. A confianca e a nossa base. O melhor laboratorio do mundo esta pronto para o futuro.";

  static buildHealthCheck(options?: {
    balance?: GlobalBatchBalance;
    revenue?: RevenueCycleReport;
    sentinel?: SentinelReport;
  }): SocietyHealthItem[] {
    const ipOk = (options?.balance?.approvedCount ?? 0) > 0;
    const financeOk = (options?.revenue?.gmPaymentBRL ?? 0) >= 0;
    const labOk = (options?.balance?.totalFormulas ?? 0) > 0;
    const sentinelOk = options?.sentinel?.systemHealth === "OPTIMAL" || !options?.sentinel;

    return [
      {
        label: "Capital Intelectual: PROTEGIDO",
        status: ipOk ? "OK" : "ATENCAO",
      },
      {
        label: "Compromissos Financeiros (GM/Google): PROVISIONADOS",
        status: financeOk ? "OK" : "ATENCAO",
      },
      {
        label: "Infraestrutura de Laboratorio: 100% OPERACIONAL",
        status: labOk ? "OK" : "ATENCAO",
      },
      {
        label: "Meta Humanóide: EM PROGRESSO (Fase de Capitalizacao)",
        status: sentinelOk ? "OK" : "ATENCAO",
      },
    ];
  }

  static buildReport(options?: {
    balance?: GlobalBatchBalance;
    revenue?: RevenueCycleReport;
    royalties?: RoyaltyTrackingReport;
    sentinel?: SentinelReport;
  }): SocietyIntegrityReport {
    const allOk = this.buildHealthCheck(options).every((h) => h.status === "OK");

    return {
      partnership: this.PARTNERSHIP,
      structure: this.SPLIT,
      healthCheck: this.buildHealthCheck(options),
      licensedFormulas: options?.balance?.approvedCount ?? 0,
      grossRevenueBRL: options?.balance?.grossRevenueBRL ?? 0,
      projectedRoyaltiesBRL: options?.royalties?.totalRoyaltiesBRL ?? 0,
      societyMessage: this.SYSTEM_MESSAGE,
      finalStatus: allOk
        ? "PRONTO PARA EXPANSAO GLOBAL"
        : "REVISAO SOCIETARIA RECOMENDADA",
      validatedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Valida integridade da operacao ChemVault / BIJU.
   */
  static validateSocietyStatus(
    options?: {
      balance?: GlobalBatchBalance;
      revenue?: RevenueCycleReport;
      royalties?: RoyaltyTrackingReport;
      sentinel?: SentinelReport;
      logToConsole?: boolean;
    },
  ): SocietyIntegrityReport {
    const report = this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (!log) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   RELATORIO DE INTEGRIDADE DA SOCIEDADE");
    console.log(`   SOCIOS: ${report.partnership}`);
    console.log(`   ESTRUTURA: ${report.structure}`);
    console.log("-".repeat(45));

    for (const item of report.healthCheck) {
      const mark = item.status === "OK" ? "OK" : "ATENCAO";
      console.log(`[${mark}]: ${item.label}`);
    }

    if (report.licensedFormulas > 0) {
      console.log(
        `\nMETRICAS: ${report.licensedFormulas} licencas · R$ ${report.grossRevenueBRL.toFixed(2)} bruto`,
      );
      if (report.projectedRoyaltiesBRL > 0) {
        console.log(`ROYALTIES PROJETADOS: R$ ${report.projectedRoyaltiesBRL.toFixed(2)}`);
      }
    }

    console.log("\nMENSAGEM DO SISTEMA:");
    console.log(`   "${report.societyMessage}"`);
    console.log("-".repeat(45));
    console.log(`STATUS FINAL: ${report.finalStatus}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistSocietyReport(
    report: SocietyIntegrityReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-society");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_society_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
