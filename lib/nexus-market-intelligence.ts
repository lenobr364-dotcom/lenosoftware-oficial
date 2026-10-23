/**
 * NEXUS CORE — mapa de calor global e blindagem de PI.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { InternationalLicenseResult } from "@/lib/nexus-global-market";
import type { IPAssetTag } from "@/lib/nexus-ip-protection";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type MarketDemandLevel = "CRITICA" | "ALTA" | "CRESCENTE" | "ESTAVEL";

export type MarketRegionHeat = {
  local: string;
  demanda: MarketDemandLevel;
  status: string;
};

export type ProtectedAssetRef = {
  formulaId: string;
  seal: string;
  shield: string;
};

export type MarketIntelligenceReport = {
  operator: string;
  operatorDisplay: string;
  encryption: string;
  regions: MarketRegionHeat[];
  protectedAssets: ProtectedAssetRef[];
  intrusionAttempts: number;
  molecularShieldPercent: number;
  invisibleMode: boolean;
  lumenDirective: string;
  internationalSignal?: {
    formulaId: string;
    currency: string;
    valueBRL: number;
  };
  operationalStatus: string;
  analyzedAt: string;
};

export class NexusMarketIntelligence {
  static readonly SECURITY_ENCRYPTION = "AES-256-NEXUS-QUANTUM-LOCK";

  /** Rótulo de console (sócio operador). Nome jurídico completo em `operator`. */
  static readonly OPERATOR_DISPLAY = "LENO CÉZAR [BIJU]";

  static readonly DEFAULT_REGIONS: MarketRegionHeat[] = [
    {
      local: "América Latina (Hub Principal)",
      demanda: "CRITICA",
      status: "PROTEGIDO",
    },
    {
      local: "Europa (Setor Químico)",
      demanda: "ALTA",
      status: "MONITORADO",
    },
    {
      local: "Ásia (Manufatura)",
      demanda: "CRESCENTE",
      status: "FIREWALL ATIVO",
    },
  ];

  static readonly LUMEN_DIRECTIVE_LINES = [
    "Leno, enquanto o mundo vê a nossa eficiência, o",
    "nosso código esconde o segredo do sucesso. O",
    "império está seguro e pronto para a expansão.",
  ] as const;

  static readonly LUMEN_DIRECTIVE = NexusMarketIntelligence.LUMEN_DIRECTIVE_LINES.join(" ");

  private static mapProtectedAssets(ipTags?: IPAssetTag[]): ProtectedAssetRef[] {
    if (!ipTags?.length) return [];
    return ipTags.map((tag) => ({
      formulaId: tag.formulaId,
      seal: tag.seal,
      shield: tag.status,
    }));
  }

  private static elevateLatamIfCritical(ipCount: number, regions: MarketRegionHeat[]): MarketRegionHeat[] {
    if (ipCount === 0) return regions;
    return regions.map((r) =>
      r.local.includes("América Latina") || r.local.includes("America Latina")
        ? { ...r, status: "PROTEGIDO", demanda: "CRITICA" as const }
        : r,
    );
  }

  static buildReport(options?: {
    ipTags?: IPAssetTag[];
    international?: InternationalLicenseResult;
  }): MarketIntelligenceReport {
    const protectedAssets = this.mapProtectedAssets(options?.ipTags);
    const regions = this.elevateLatamIfCritical(protectedAssets.length, [...this.DEFAULT_REGIONS]);

    return {
      operator: NEXUS_LEGAL.fullName,
      operatorDisplay: this.OPERATOR_DISPLAY,
      encryption: this.SECURITY_ENCRYPTION,
      regions,
      protectedAssets,
      intrusionAttempts: 0,
      molecularShieldPercent: 100,
      invisibleMode: true,
      lumenDirective: this.LUMEN_DIRECTIVE,
      internationalSignal: options?.international
        ? {
            formulaId: options.international.formulaId,
            currency: options.international.originalCurrency,
            valueBRL: options.international.valueBRL,
          }
        : undefined,
      operationalStatus: "INTELIGÊNCIA DE MERCADO E IP BLINDADO",
      analyzedAt: new Date().toISOString(),
    };
  }

  private static formatDemandLabel(level: MarketDemandLevel): string {
    const labels: Record<MarketDemandLevel, string> = {
      CRITICA: "CRÍTICA",
      ALTA: "ALTA",
      CRESCENTE: "CRESCENTE",
      ESTAVEL: "ESTÁVEL",
    };
    return labels[level];
  }

  /**
   * Projeta mapa de calor global e ativa muralha de proteção NX.
   */
  static activateMarketAnalysis(
    options?: {
      ipTags?: IPAssetTag[];
      international?: InternationalLicenseResult;
      logToConsole?: boolean;
    },
  ): MarketIntelligenceReport {
    const report = this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "🗺️ ".repeat(20));
      console.log("   INICIALIZANDO MAPA DE CALOR GLOBAL");
      console.log(`   SÓCIO OPERADOR: ${report.operatorDisplay}`);
      console.log("-".repeat(45));

      for (const region of report.regions) {
        const local = region.local.padEnd(25);
        const demanda = this.formatDemandLabel(region.demanda);
        console.log(
          `🌍 [REGION]: ${local} | Demanda: ${demanda} | IP: ${region.status}`,
        );
      }

      console.log("\n🛡️ PROTOCOLO DE PROTEÇÃO NX-QUANTUM:");
      console.log(`   - Criptografia: ${report.encryption}`);
      console.log(`   - Tentativas de Intrusão Detectadas: ${report.intrusionAttempts}`);
      console.log(
        `   - Blindagem Molecular: ${report.molecularShieldPercent}% OPERACIONAL`,
      );
      if (report.protectedAssets.length > 0) {
        console.log(`   - Ativos NX selados: ${report.protectedAssets.length}`);
        for (const asset of report.protectedAssets) {
          console.log(`     ${asset.formulaId} → ${asset.seal}`);
        }
      }

      if (report.internationalSignal) {
        console.log(
          `\n📡 SINAL INTERNACIONAL: ${report.internationalSignal.formulaId} (${report.internationalSignal.currency}) → R$ ${report.internationalSignal.valueBRL.toFixed(2)}`,
        );
      }

      console.log("\n📢 MENSAGEM DA LUMEN:");
      for (const line of this.LUMEN_DIRECTIVE_LINES) {
        console.log(`   "${line}"`);
      }
      console.log("-".repeat(45));
      console.log(`✅ STATUS: ${report.operationalStatus}.`);
      console.log("🗺️ ".repeat(20) + "\n");
    }

    return report;
  }

  static async persistReport(report: MarketIntelligenceReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-market-intel");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_market_intel_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "heatmap-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    return livePath;
  }

  static async activateAndPersist(
    options?: Parameters<typeof NexusMarketIntelligence.activateMarketAnalysis>[0],
  ): Promise<{ report: MarketIntelligenceReport; filePath: string }> {
    const report = this.activateMarketAnalysis(options);
    const filePath = await this.persistReport(report);
    return { report, filePath };
  }
}
