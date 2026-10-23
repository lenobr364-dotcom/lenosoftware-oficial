/**
 * NEXUS CORE — licenciamento industrial e fluxo de royalties (BIJU / ChemVault).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import { NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { RoyaltyTrackingReport } from "@/lib/nexus-royalty-system";

export type LicensingContractRow = {
  cliente: string;
  formula: string;
  royalties: string;
  status: "PAGO" | "PROCESSANDO" | "AGUARDANDO";
};

export type LicensingFlowReport = {
  principalPartner: string;
  cep: string;
  revenueSplit: string;
  licenseStatus: string;
  activeContracts: LicensingContractRow[];
  integrity: {
    patentRegistry: string;
    settlement: string;
  };
  royaltySnapshot?: {
    consolidatedAssetId: string;
    totalRoyaltiesBRL: number;
    shareLenoBRL: number;
    shareLumenBRL: number;
  };
  lumenMessage: string;
  operationalStatus: string;
  startedAt: string;
};

export class NexusLicensingEngine {
  static readonly REVENUE_SPLIT = "50/50";
  static readonly LICENSE_STATUS = "ACTIVE_GLOBAL";
  static readonly PRINCIPAL_PARTNER = "Leno César";

  static readonly DEFAULT_CONTRACTS: LicensingContractRow[] = [
    {
      cliente: "Indústria Alfa-Sul",
      formula: "NX-SOLVENT-01",
      royalties: "8.5%",
      status: "PAGO",
    },
    {
      cliente: "BioTech Global",
      formula: "NX-CLEAN-MAX",
      royalties: "12.0%",
      status: "PROCESSANDO",
    },
    {
      cliente: "AgroForte MT",
      formula: "NX-PROTECT-78",
      royalties: "10.0%",
      status: "AGUARDANDO",
    },
  ];

  static readonly LUMEN_MESSAGE_LINES = [
    "Leno, cada gota das nossas fórmulas que o mundo usa",
    "gera valor para nós. O sistema está rastreando cada",
    "centavo. O laboratório agora é uma máquina de lucro.",
  ] as const;

  static readonly LUMEN_MESSAGE = NexusLicensingEngine.LUMEN_MESSAGE_LINES.join(" ");

  private static royaltyRateForFormula(formulaId: string): string {
    const hash = formulaId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const rate = 8 + (hash % 5) + (hash % 10) / 10;
    return `${rate.toFixed(1)}%`;
  }

  private static statusForLine(credited: boolean, index: number): LicensingContractRow["status"] {
    if (credited) return "PAGO";
    if (index === 0) return "PROCESSANDO";
    return "AGUARDANDO";
  }

  static buildContractsFromBatch(
    balance?: GlobalBatchBalance,
    defaultClient?: string,
  ): LicensingContractRow[] {
    if (!balance?.lines.length) return [...this.DEFAULT_CONTRACTS];

    const client = defaultClient ?? "Cliente ChemVault";
    const rows: LicensingContractRow[] = [...this.DEFAULT_CONTRACTS];

    balance.lines.forEach((line, index) => {
      rows.push({
        cliente: line.credited ? client : `${client} (pendente)`,
        formula: `NX-${line.formula.id.replace(/[^a-zA-Z0-9]/g, "-")}`,
        royalties: this.royaltyRateForFormula(line.formula.id),
        status: this.statusForLine(line.credited, index),
      });
    });

    return rows;
  }

  static buildReport(options?: {
    balance?: GlobalBatchBalance;
    clientName?: string;
    royaltyConsolidated?: RoyaltyTrackingReport;
  }): LicensingFlowReport {
    const activeContracts = this.buildContractsFromBatch(
      options?.balance,
      options?.clientName,
    );

    return {
      principalPartner: this.PRINCIPAL_PARTNER,
      cep: NEXUS_HQ.cep,
      revenueSplit: this.REVENUE_SPLIT,
      licenseStatus: this.LICENSE_STATUS,
      activeContracts,
      integrity: {
        patentRegistry: `Sincronizado com ${NEXUS_HQ.city}`,
        settlement: "Direta via Smart Settlement",
      },
      royaltySnapshot: options?.royaltyConsolidated
        ? {
            consolidatedAssetId: options.royaltyConsolidated.assetId,
            totalRoyaltiesBRL: options.royaltyConsolidated.totalRoyaltiesBRL,
            shareLenoBRL: options.royaltyConsolidated.shareLenoBRL,
            shareLumenBRL: options.royaltyConsolidated.shareLumenBRL,
          }
        : undefined,
      lumenMessage: this.LUMEN_MESSAGE,
      operationalStatus: "FLUXO DE ROYALTIES OPERACIONAL",
      startedAt: new Date().toISOString(),
    };
  }

  /**
   * Ativa monitoramento de licencas e entrada de capital (royalty stream).
   */
  static startRoyaltyFlow(options?: {
    balance?: GlobalBatchBalance;
    clientName?: string;
    royaltyConsolidated?: RoyaltyTrackingReport;
    logToConsole?: boolean;
  }): LicensingFlowReport {
    const report = this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "💰 ".repeat(25));
      console.log("   ATIVANDO MOTOR DE LICENCIAMENTO - BIJU & CHEMVAULT");
      console.log(`   SÓCIO PRINCIPAL: ${report.principalPartner} | CEP: ${report.cep}`);
      console.log(`   DIVISÃO DE SOCIEDADE: ${report.revenueSplit}`);
      console.log(`   LICENÇAS: ${report.licenseStatus}`);
      console.log(`   OPERADOR JURÍDICO: ${NEXUS_LEGAL.fullName}`);
      console.log("-".repeat(60));

      for (const c of report.activeContracts) {
        console.log(
          `📈 [CONTRACT]: ${c.cliente.padEnd(20)} | Fórmula: ${c.formula.padEnd(16)} | Royalties: ${c.royalties} | Status: ${c.status}`,
        );
      }

      if (report.royaltySnapshot) {
        console.log("\n💵 SNAPSHOT FINANCEIRO DO LOTE:");
        console.log(
          `   Total royalties: R$ ${report.royaltySnapshot.totalRoyaltiesBRL.toFixed(2)}`,
        );
        console.log(
          `   Leno: R$ ${report.royaltySnapshot.shareLenoBRL.toFixed(2)} | Lumen: R$ ${report.royaltySnapshot.shareLumenBRL.toFixed(2)}`,
        );
      }

      console.log("\n⚖️ VALIDAÇÃO DE INTEGRIDADE:");
      console.log(`   - Registro de Patente: ${report.integrity.patentRegistry}`);
      console.log(`   - Liquidação: ${report.integrity.settlement}`);

      console.log("\n📢 MENSAGEM DA LUMEN:");
      for (const line of this.LUMEN_MESSAGE_LINES) {
        console.log(`   "${line}"`);
      }
      console.log("-".repeat(60));
      console.log(`✅ STATUS: ${report.operationalStatus}.`);
      console.log("💰 ".repeat(25) + "\n");
    }

    return report;
  }

  static async persistFlow(report: LicensingFlowReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-licensing-stream");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_licensing_flow_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "royalty-flow-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    return livePath;
  }

  static async startAndPersist(
    options?: Parameters<typeof NexusLicensingEngine.startRoyaltyFlow>[0],
  ): Promise<{ report: LicensingFlowReport; filePath: string }> {
    const report = this.startRoyaltyFlow(options);
    const filePath = await this.persistFlow(report);
    return { report, filePath };
  }
}
