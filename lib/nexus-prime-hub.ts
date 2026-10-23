/**
 * NEXUS PRIME — Global Authority Hub (comando definitivo do laboratorio).
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";

export type NexusPrimeReport = {
  version: string;
  partnership: string;
  financialHub: string;
  activeFormulas: number;
  totalFormulas: number;
  grossRevenueBRL: number;
  netLabIncomeBRL: number;
  royaltyPerPartnerBRL: number;
  internationalLevel: string;
  verdict: string;
  transitionReady: boolean;
};

export class NexusPrimeHub {
  static readonly VERSION = "1.0.0-GOLD";
  static readonly PARTNERSHIP = `${NEXUS_LEGAL.partnership} (50/50)`;
  static readonly FINANCIAL_HUB = NEXUS_LEGAL.company;
  static readonly DEFAULT_LICENSE_FEE_BRL = 5_000;

  static buildReport(balance?: GlobalBatchBalance): NexusPrimeReport {
    const activeFormulas = balance?.approvedCount ?? 3;
    const totalFormulas = balance?.totalFormulas ?? activeFormulas;
    const grossRevenueBRL =
      balance?.grossRevenueBRL ?? activeFormulas * this.DEFAULT_LICENSE_FEE_BRL;
    const netLabIncomeBRL = balance?.netLabIncomeBRL ?? grossRevenueBRL;
    const royaltyPerPartnerBRL =
      balance?.partnerShareLenoBRL ?? grossRevenueBRL / 2;

    const internationalLevel =
      activeFormulas >= totalFormulas
        ? "Nivel 1 Internacional"
        : activeFormulas >= 2
          ? "Nivel 1 Internacional (parcial)"
          : "Nivel 2 — revisao termica necessaria";

    return {
      version: this.VERSION,
      partnership: this.PARTNERSHIP,
      financialHub: this.FINANCIAL_HUB,
      activeFormulas,
      totalFormulas,
      grossRevenueBRL,
      netLabIncomeBRL,
      royaltyPerPartnerBRL,
      internationalLevel,
      verdict: `O laboratorio esta operando em ${internationalLevel}.`,
      transitionReady: activeFormulas >= 2,
    };
  }

  /**
   * Ativa o hub de autoridade global e imprime estatisticas de dominacao.
   */
  static activate(balance?: GlobalBatchBalance, logToConsole = true): NexusPrimeReport {
    const report = this.buildReport(balance);

    if (!logToConsole) return report;

    console.log("\n" + "=".repeat(50));
    console.log("   NEXUS PRIME - GLOBAL AUTHORITY ACTIVATED");
    console.log(`   VERSION: ${report.version}`);
    console.log(`   SOCIETY: ${report.partnership}`);
    console.log(`   FINANCIAL HUB: ${report.financialHub}`);
    console.log("=".repeat(50));

    console.log("\nESTATISTICAS DE DOMINACAO:");
    console.log(
      `- Formulas Ativas: ${report.activeFormulas}/${report.totalFormulas}`,
    );
    console.log(`- Faturamento Bruto: R$ ${report.grossRevenueBRL.toFixed(2)}`);
    if (balance && balance.operationalCostBRL > 0) {
      console.log(`- Liquido Lab: R$ ${report.netLabIncomeBRL.toFixed(2)}`);
    }
    console.log(`- Royaltie por Socio: R$ ${report.royaltyPerPartnerBRL.toFixed(2)}`);

    console.log("\nVEREDITO FINAL:");
    console.log(report.verdict);
    if (report.transitionReady) {
      console.log("Pronto para a transicao definitiva em BH.");
    } else {
      console.log("Aguardando mais ativos licenciados para transicao BH.");
    }
    console.log("=".repeat(40) + "\n");

    return report;
  }
}
