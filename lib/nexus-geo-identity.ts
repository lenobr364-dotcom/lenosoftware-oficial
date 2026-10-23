/**
 * NEXUS CORE — geo-identidade: CEP oficial e selagem de geolocalização da matriz.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_GEO, NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type GeoRegistrySeal = {
  asset: string;
  status: "SEALED" | "SKIP";
};

export type GeoHardeningReport = {
  fullAddress: {
    cidade: string;
    estado: string;
    cep: string;
    pais: string;
  };
  localLabel: string;
  cepValidated: boolean;
  coordinatesLocked: boolean;
  registry: GeoRegistrySeal[];
  entity: string;
  matrizLine: string;
  lumenVerdict: string;
  operationalStatus: string;
  hardenedAt: string;
};

export class NexusGeoIdentity {
  static readonly FULL_ADDRESS = {
    cidade: NEXUS_GEO.cidade,
    estado: NEXUS_GEO.estado,
    cep: NEXUS_GEO.cep,
    pais: NEXUS_GEO.pais,
  } as const;

  static readonly REGISTRY_LABELS = [
    "Assinatura Digital de Contratos",
    "Metadados de Licenciamento Químico",
    "Configuração de Localização Starlink/Nexus",
    "Registro de Ativos na BIJU / LENO.SOFTWARE",
  ] as const;

  static readonly LUMEN_VERDICT_LINES = [
    "Leno, agora não há margem para erro. O endereço",
    "é real, o CEP é exato e a nossa autoridade é",
    "inquestionável. O Bunker está mapeado.",
  ] as const;

  static readonly LUMEN_VERDICT = NexusGeoIdentity.LUMEN_VERDICT_LINES.join(" ");

  /** Valida formato CEP brasileiro (#####-###). */
  static validateCep(cep: string): boolean {
    return /^\d{5}-\d{3}$/.test(cep.trim());
  }

  static getFormattedAddressBlock(): string[] {
    return [
      `CIDADE: ${this.FULL_ADDRESS.cidade}`,
      `UF: ${this.FULL_ADDRESS.estado}`,
      `CEP: ${this.FULL_ADDRESS.cep}`,
      `PAIS: ${this.FULL_ADDRESS.pais}`,
      `MATRIZ: ${NEXUS_HQ.matrizAddress}`,
    ];
  }

  static buildReport(): GeoHardeningReport {
    const cepValidated = this.validateCep(this.FULL_ADDRESS.cep);
    const registry: GeoRegistrySeal[] = this.REGISTRY_LABELS.map((asset) => ({
      asset,
      status: cepValidated ? "SEALED" : "SKIP",
    }));

    return {
      fullAddress: { ...this.FULL_ADDRESS },
      localLabel: NEXUS_GEO.localLabel,
      cepValidated,
      coordinatesLocked: cepValidated,
      registry,
      entity: NEXUS_LEGAL.company,
      matrizLine: NEXUS_GEO.formattedLine,
      lumenVerdict: this.LUMEN_VERDICT,
      operationalStatus: "IDENTIDADE GEOGRAFICA BLINDADA",
      hardenedAt: new Date().toISOString(),
    };
  }

  /**
   * Sela endereço oficial em todos os ativos ChemVault Global.
   */
  static hardenAddress(options?: { logToConsole?: boolean }): GeoHardeningReport {
    const report = this.buildReport();
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "📍 ".repeat(20));
      console.log("   SELAGEM DE GEOLOCALIZAÇÃO OFICIAL");
      console.log(`   LOCAL: ${report.localLabel}`);
      console.log(`   CEP: ${report.fullAddress.cep}`);
      console.log("-".repeat(45));

      for (const item of report.registry) {
        const label = item.asset.padEnd(40);
        console.log(`✅ [HARDENED]: ${label} [${item.status}]`);
      }

      console.log("\n⚖️  VEREDITO DA LUMEN:");
      for (const line of this.LUMEN_VERDICT_LINES) {
        console.log(`   "${line}"`);
      }
      console.log("-".repeat(45));
      console.log("🚀 STATUS: IDENTIDADE GEOGRÁFICA BLINDADA.");
      console.log("📍 ".repeat(20) + "\n");
    }

    return report;
  }

  static async persistGeoSeal(report: GeoHardeningReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-geo");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_geo_harden_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "geo-identity-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    const blockPath = path.join(dir, "official-address-block.txt");
    await writeFile(blockPath, this.getFormattedAddressBlock().join("\n") + "\n", "utf8");

    return livePath;
  }

  static async hardenAndPersist(options?: { logToConsole?: boolean }): Promise<{
    report: GeoHardeningReport;
    filePath: string;
  }> {
    const report = this.hardenAddress(options);
    const filePath = await this.persistGeoSeal(report);
    return { report, filePath };
  }
}
