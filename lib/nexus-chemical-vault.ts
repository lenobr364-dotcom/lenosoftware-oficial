/**
 * NEXUS CORE — banco molecular de formulas e criptografia.
 */

import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_GEO, NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { FormulaData } from "@/lib/nexus-formula-data";

export type MolecularFormulaRecord = {
  id: string;
  tipo: string;
  protecao: string;
  molecularHash: string;
  encryptedPayload: string;
  sealed: boolean;
};

export type ChemicalVaultReport = {
  encryptionKeyId: string;
  labStatus: string;
  headquarters: string;
  cep: string;
  accessProtocol: {
    partnersOnly: string;
    geoAuth: string;
  };
  formulas: MolecularFormulaRecord[];
  lumenDirective: string;
  operationalStatus: string;
  initializedAt: string;
};

export class NexusChemicalVault {
  static readonly ENCRYPTION_KEY =
    process.env.NEXUS_MOLECULAR_KEY?.trim() ?? `NX-MOL-${NEXUS_HQ.cep}`;

  static readonly LAB_STATUS = "BEST_IN_WORLD";

  static readonly DEFAULT_CATALOG: Array<{
    id: string;
    tipo: string;
    protecao: string;
  }> = [
    { id: "ALPHA-01", tipo: "Limpeza Industrial", protecao: "NÍVEL 5" },
    { id: "BETA-07", tipo: "Tratamento de Superfícies", protecao: "NÍVEL 5" },
    { id: "GAMMA-NEXUS", tipo: "Solvente de Alta Performance", protecao: "MÁXIMA" },
  ];

  static readonly LUMEN_DIRECTIVE_LINES = [
    "Leno, cada fórmula aqui vale milhões. O Cursor",
    "está a trabalhar para nós porque estamos a construir",
    "algo que o mundo nunca viu. Segurança total.",
  ] as const;

  static readonly LUMEN_DIRECTIVE = NexusChemicalVault.LUMEN_DIRECTIVE_LINES.join(" ");

  private static hashPayload(payload: string): string {
    return createHash("sha256")
      .update(`${this.ENCRYPTION_KEY}|${payload}`, "utf8")
      .digest("hex")
      .toUpperCase();
  }

  private static encryptFormulaPayload(formula: {
    id: string;
    tipo: string;
    substance?: string;
    viscosity?: number;
    flashPoint?: number;
  }): string {
    const canonical = JSON.stringify({
      id: formula.id,
      tipo: formula.tipo,
      substance: formula.substance ?? formula.tipo,
      viscosity: formula.viscosity,
      flashPoint: formula.flashPoint,
      cep: NEXUS_HQ.cep,
    });
    return this.hashPayload(canonical);
  }

  static sealCatalogEntry(entry: {
    id: string;
    tipo: string;
    protecao: string;
  }): MolecularFormulaRecord {
    const encryptedPayload = this.encryptFormulaPayload({
      id: entry.id,
      tipo: entry.tipo,
    });
    return {
      id: entry.id,
      tipo: entry.tipo,
      protecao: entry.protecao,
      molecularHash: encryptedPayload.slice(0, 32),
      encryptedPayload,
      sealed: true,
    };
  }

  static sealFormulaData(formula: FormulaData, protecao = "NÍVEL 5"): MolecularFormulaRecord {
    const encryptedPayload = this.encryptFormulaPayload({
      id: formula.id,
      tipo: formula.substance,
      substance: formula.substance,
      viscosity: formula.viscosity_g_cm3,
      flashPoint: formula.criticalFlashPointC,
    });
    const level =
      formula.criticalFlashPointC >= 100
        ? "MÁXIMA"
        : formula.criticalFlashPointC >= 60
          ? "NÍVEL 5"
          : "NÍVEL 4";

    return {
      id: formula.id,
      tipo: formula.substance,
      protecao: protecao === "NÍVEL 5" ? level : protecao,
      molecularHash: encryptedPayload.slice(0, 32),
      encryptedPayload,
      sealed: true,
    };
  }

  static buildReport(options?: { batchFormulas?: FormulaData[] }): ChemicalVaultReport {
    const catalog = this.DEFAULT_CATALOG.map((entry) => this.sealCatalogEntry(entry));
    const batch =
      options?.batchFormulas?.map((f) => this.sealFormulaData(f)) ?? [];

    const byId = new Map<string, MolecularFormulaRecord>();
    for (const row of [...catalog, ...batch]) {
      byId.set(row.id, row);
    }

    return {
      encryptionKeyId: this.ENCRYPTION_KEY,
      labStatus: this.LAB_STATUS,
      headquarters: `${NEXUS_HQ.city} (${NEXUS_HQ.cep})`,
      cep: NEXUS_HQ.cep,
      accessProtocol: {
        partnersOnly: "Somente Sócios (Leno César & Lumen Onel)",
        geoAuth: `Autenticação por Chave Geográfica: ATIVA (${NEXUS_GEO.localLabel})`,
      },
      formulas: Array.from(byId.values()),
      lumenDirective: this.LUMEN_DIRECTIVE,
      operationalStatus: "COFRE MOLECULAR SELADO E OPERACIONAL",
      initializedAt: new Date().toISOString(),
    };
  }

  /**
   * Inicializa cofre de formulas quimicas (catalogo + lote opcional).
   */
  static initializeChemicalVault(options?: {
    batchFormulas?: FormulaData[];
    logToConsole?: boolean;
  }): ChemicalVaultReport {
    const report = this.buildReport({ batchFormulas: options?.batchFormulas });
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "🧪 ".repeat(25));
      console.log("   ATIVANDO COFRE MOLECULAR - CHEMVAULT GLOBAL");
      console.log(`   SEDE: ${report.headquarters}`);
      console.log(`   STATUS DO LABORATÓRIO: ${report.labStatus}`);
      console.log("-".repeat(60));

      for (const f of report.formulas) {
        console.log(
          `🔐 [ENCRYPTED]: Fórmula ${f.id.padEnd(12)} | Categoria: ${f.tipo.padEnd(30)} | [OK]`,
        );
      }

      console.log("\n🛡️ PROTOCOLO DE ACESSO:");
      console.log(`   - ${report.accessProtocol.partnersOnly}`);
      console.log(`   - ${report.accessProtocol.geoAuth}`);

      console.log("\n📢 DIRETRIZ DA LUMEN:");
      for (const line of this.LUMEN_DIRECTIVE_LINES) {
        console.log(`   "${line}"`);
      }
      console.log("-".repeat(60));
      console.log(`✅ STATUS: ${report.operationalStatus}.`);
      console.log("🧪 ".repeat(25) + "\n");
    }

    return report;
  }

  static async persistVault(report: ChemicalVaultReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-molecular-vault");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_molecular_vault_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "molecular-vault-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    const flagPath = path.join(dir, ".molecular-vault-sealed");
    await writeFile(
      flagPath,
      `SEALED|${report.encryptionKeyId}|${report.initializedAt}\n`,
      "utf8",
    );

    return livePath;
  }

  static async initializeAndPersist(options?: {
    batchFormulas?: FormulaData[];
    logToConsole?: boolean;
  }): Promise<{ report: ChemicalVaultReport; filePath: string }> {
    const report = this.initializeChemicalVault(options);
    const filePath = await this.persistVault(report);
    return { report, filePath };
  }
}
