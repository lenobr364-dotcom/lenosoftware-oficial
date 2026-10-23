/**
 * NEXUS CORE — cofre de histórico e rastreabilidade do Lab Digital Gemini.
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { LicenseAudit } from "@/lib/chemvault-nexus";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";
import type { FormulaData } from "@/lib/nexus-formula-data";

export interface LabHistoryEntry {
  id: string;
  substance: string;
  result: string;
  safetyScore: string;
  licenseIssued: boolean;
}

export class NexusHistoryManager {
  private static storage: LabHistoryEntry[] = [];

  static getEntries(): readonly LabHistoryEntry[] {
    return this.storage;
  }

  static clearVault(): void {
    this.storage = [];
  }

  /**
   * Salva a operação no cofre de dados do Laboratório.
   */
  static saveToVault(
    formula: FormulaData,
    audit: LicenseAudit,
    result: SimulationResult,
    logToConsole = true,
  ): LabHistoryEntry {
    const entry: LabHistoryEntry = {
      id: formula.id,
      substance: formula.substance,
      result: result.status,
      safetyScore: result.safetyIndex,
      licenseIssued: audit.isApproved,
    };

    this.storage.push(entry);

    if (logToConsole) {
      console.log(`\nVault Gemini: Registro da formula ${formula.id} arquivado com sucesso.`);
    }

    return entry;
  }

  /**
   * Exibe o relatório de inteligência do laboratório.
   */
  static showVaultSummary(logToConsole = true): void {
    if (!logToConsole) return;

    console.log("\n" + "=".repeat(60));
    console.log("   RELATORIO DE INTELIGENCIA - COFRE CHEMVAULT");
    console.log("=".repeat(60));

    this.storage.forEach((item) => {
      const status = item.licenseIssued ? "LICENCIADA" : "REJEITADA";
      console.log(`- ${item.id} [${item.substance}]: ${status} (${item.safetyScore})`);
    });

    const licensed = this.storage.filter((e) => e.licenseIssued).length;
    console.log(`\nTOTAL DE ATIVOS NO COFRE: ${this.storage.length}`);
    console.log(`LICENCIADAS: ${licensed} | REJEITADAS: ${this.storage.length - licensed}`);
    console.log("=".repeat(60) + "\n");
  }

  /** Persiste o cofre em JSON para rastreabilidade entre execuções. */
  static async persistVault(vaultDir?: string): Promise<string> {
    const dir =
      vaultDir ?? path.join(process.cwd(), "chemvault-public", "nexus-vault");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, "gemini-lab-history.json");
    await writeFile(filePath, JSON.stringify(this.storage, null, 2), "utf8");
    return filePath;
  }

  /** Carrega histórico anterior do disco (se existir). */
  static async hydrateVault(vaultDir?: string): Promise<number> {
    const dir =
      vaultDir ?? path.join(process.cwd(), "chemvault-public", "nexus-vault");
    const filePath = path.join(dir, "gemini-lab-history.json");
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as LabHistoryEntry[];
      if (Array.isArray(parsed)) {
        this.storage = parsed;
        return parsed.length;
      }
    } catch {
      /* cofre vazio na primeira execução */
    }
    return 0;
  }
}
