/**
 * NEXUS CORE — royalties automatizados e projecao de dividendos recorrentes.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { ChemVaultRevenue } from "@/lib/chemvault-revenue";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";

export type RoyaltyTrackingReport = {
  assetId: string;
  usageVolume: number;
  royaltyPerUnitBRL: number;
  totalRoyaltiesBRL: number;
  shareLenoBRL: number;
  shareLumenBRL: number;
  destination: string;
  shareRatio: number;
  status: string;
  directive: string;
  trackedAt: string;
};

export class NexusRoyaltySystem {
  static readonly SHARE_RATIO = ChemVaultRevenue.PARTNERSHIP_RATIO;
  static readonly ROYALTY_PER_UNIT_BRL = 2.75;
  static readonly DESTINATION = "CONTA CORRENTE BIJU (SICREDI)";

  static buildRoyaltyReport(
    assetId: string,
    usageVolume: number,
    royaltyPerUnit = this.ROYALTY_PER_UNIT_BRL,
  ): RoyaltyTrackingReport {
    const totalRoyaltiesBRL = usageVolume * royaltyPerUnit;
    const share = totalRoyaltiesBRL * this.SHARE_RATIO;

    return {
      assetId,
      usageVolume,
      royaltyPerUnitBRL: royaltyPerUnit,
      totalRoyaltiesBRL,
      shareLenoBRL: share,
      shareLumenBRL: share,
      destination: this.DESTINATION,
      shareRatio: this.SHARE_RATIO,
      status: "Fluxo de caixa passivo em crescimento",
      directive: "Manter excelencia quimica para escalar volume",
      trackedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Projeta ganhos de royalties por ativo licenciado.
   */
  static trackRoyalties(
    assetId: string,
    usageVolume: number,
    logToConsole = true,
  ): RoyaltyTrackingReport {
    const report = this.buildRoyaltyReport(assetId, usageVolume);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log(`   CONTROLE DE ROYALTIES: ${assetId}`);
    console.log(`   VOLUME DE PRODUCAO DETECTADO: ${usageVolume} unidades`);
    console.log("-".repeat(45));
    console.log(`TOTAL ACUMULADO: R$ ${report.totalRoyaltiesBRL.toFixed(2)}`);
    console.log(`DESTINO: ${report.destination}`);
    console.log("-".repeat(45));
    console.log(`${NEXUS_LEGAL.fullName} (50%): R$ ${report.shareLenoBRL.toFixed(2)}`);
    console.log(`${NEXUS_LEGAL.partnerLumen} (50%): R$ ${report.shareLumenBRL.toFixed(2)}`);
    console.log(`\nSTATUS: ${report.status}.`);
    console.log(`DIRETRIZ: ${report.directive}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  /** Projeta royalties do lote (volume simulado por licenca ativa). */
  static trackBatchRoyalties(
    balance: GlobalBatchBalance,
    usagePerLicense = 5_000,
    logToConsole = true,
  ): { reports: RoyaltyTrackingReport[]; consolidated: RoyaltyTrackingReport } {
    const reports: RoyaltyTrackingReport[] = [];

    for (const line of balance.lines) {
      if (!line.credited) continue;
      const assetId = line.audit.licenseID;
      reports.push(this.trackRoyalties(assetId, usagePerLicense, logToConsole));
    }

    const totalVolume = reports.reduce((sum, r) => sum + r.usageVolume, 0);
    const consolidated = this.buildRoyaltyReport("LOTE-CONSOLIDADO", totalVolume);
    consolidated.assetId = `LOTE-${balance.approvedCount}-ATIVOS`;

    if (logToConsole && reports.length > 0) {
      console.log("\n--- ROYALTIES CONSOLIDADOS DO LOTE ---");
      console.log(`TOTAL: R$ ${consolidated.totalRoyaltiesBRL.toFixed(2)}`);
      console.log(
        `LENO: R$ ${consolidated.shareLenoBRL.toFixed(2)} | LUMEN: R$ ${consolidated.shareLumenBRL.toFixed(2)}`,
      );
    }

    return { reports, consolidated };
  }

  static async persistRoyaltyReport(
    report: RoyaltyTrackingReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-royalties");
    await mkdir(dir, { recursive: true });
    const safeId = report.assetId.replace(/[^a-zA-Z0-9-]/g, "_").slice(0, 48);
    const filePath = path.join(dir, `leno_royalty_${safeId}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
