/**
 * NEXUS CORE — reservas de lucro, dividendos, GM e creditos Google.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { ChemVaultRevenue } from "@/lib/chemvault-revenue";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";

export type RevenueCycleReport = {
  source: string;
  totalRevenueBRL: number;
  googleCloudReserveBRL: number;
  gmProvisionPercent: number;
  netAfterReserveBRL: number;
  gmPaymentBRL: number;
  distributableBRL: number;
  dividendLenoBRL: number;
  dividendLumenBRL: number;
  status: string;
  directive: string;
  processedAt: string;
};

export class NexusFinancialIntelligence {
  static readonly GOOGLE_CLOUD_RESERVE_BRL = 500;
  static readonly GM_PROVISION_RATIO = 0.1;
  static readonly REVENUE_SOURCE = "RECEBIMENTO BIJU (SICREDI)";

  static buildRevenueCycle(totalRevenue: number): RevenueCycleReport {
    const reserve = this.GOOGLE_CLOUD_RESERVE_BRL;
    const netAfterReserve = Math.max(totalRevenue - reserve, 0);
    const gmPayment = netAfterReserve * this.GM_PROVISION_RATIO;
    const distributable = Math.max(netAfterReserve - gmPayment, 0);
    const dividend = distributable * ChemVaultRevenue.PARTNERSHIP_RATIO;

    return {
      source: this.REVENUE_SOURCE,
      totalRevenueBRL: totalRevenue,
      googleCloudReserveBRL: reserve,
      gmProvisionPercent: this.GM_PROVISION_RATIO * 100,
      netAfterReserveBRL: netAfterReserve,
      gmPaymentBRL: gmPayment,
      distributableBRL: distributable,
      dividendLenoBRL: dividend,
      dividendLumenBRL: dividend,
      status: "Fluxo financeiro atualizado e protegido",
      directive: "Creditos Google em dia. Foco total no crescimento.",
      processedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Processa divisao de lucros e obrigacoes do laboratorio.
   */
  static processRevenueCycle(
    totalRevenue: number,
    logToConsole = true,
  ): RevenueCycleReport {
    const report = this.buildRevenueCycle(totalRevenue);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   CONTROLE DE RESERVAS E DIVIDENDOS");
    console.log(`   FONTE: ${report.source}`);
    console.log("-".repeat(45));
    console.log(
      `[AUTOMACAO]: Creditos Google Cloud... [RESERVADO: R$ ${report.googleCloudReserveBRL.toFixed(2)}]`,
    );
    console.log(
      `[ACORDO]: Provisao para GM (${report.gmProvisionPercent}%)... [LANCADO: R$ ${report.gmPaymentBRL.toFixed(2)}]`,
    );
    console.log("-".repeat(45));
    console.log(`DIVIDENDOS ${NEXUS_LEGAL.fullName} (50%): R$ ${report.dividendLenoBRL.toFixed(2)}`);
    console.log(`DIVIDENDOS ${NEXUS_LEGAL.partnerLumen} (50%): R$ ${report.dividendLumenBRL.toFixed(2)}`);
    console.log(`\nSTATUS: ${report.status}.`);
    console.log(`DIRETRIZ: ${report.directive}`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static processFromBatch(
    balance: GlobalBatchBalance,
    extraRevenueBRL = 0,
    logToConsole = true,
  ): RevenueCycleReport {
    const total = balance.netLabIncomeBRL + extraRevenueBRL;
    return this.processRevenueCycle(total, logToConsole);
  }

  static async persistRevenueCycle(
    report: RevenueCycleReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-financial");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_revenue_cycle_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
