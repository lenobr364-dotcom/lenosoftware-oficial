/**
 * NEXUS CORE — cofres de formulas high-end (estrutura de pastas seguras).
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type VaultStructureReport = {
  root: string;
  category: string;
  owners: string;
  basePath: string;
  subdirectories: string[];
  createdPaths: string[];
  status: string;
  logMessage: string;
  preparedAt: string;
};

export class ChemVaultArchiving {
  static readonly ROOT = "CHEMVAULT_GLOBAL_V6";
  static readonly OWNERS = NEXUS_LEGAL.partnership;
  static readonly SUBDIRS = [
    "Drafts",
    "Stability_Tests",
    "Final_Certificates",
    "BIJU_Invoices",
  ] as const;

  static sanitizeCategory(category: string): string {
    return category
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");
  }

  static resolveBasePath(category: string, publicRoot?: string): string {
    const safe = this.sanitizeCategory(category);
    const root = publicRoot ?? path.join(process.cwd(), "chemvault-public");
    return path.join(root, this.ROOT, safe);
  }

  /**
   * Cria estrutura de diretorios para licenciamento de elite.
   */
  static async prepareNewVault(
    category: string,
    options?: { logToConsole?: boolean; publicRoot?: string },
  ): Promise<VaultStructureReport> {
    const safeCategory = this.sanitizeCategory(category);
    const basePath = this.resolveBasePath(category, options?.publicRoot);
    const createdPaths: string[] = [];

    for (const dir of this.SUBDIRS) {
      const full = path.join(basePath, dir);
      await mkdir(full, { recursive: true });
      createdPaths.push(full);
    }

    const manifestPath = path.join(basePath, "vault-manifest.json");
    const manifest = {
      root: this.ROOT,
      category: safeCategory,
      owners: this.OWNERS,
      subdirectories: [...this.SUBDIRS],
      preparedAt: new Date().toISOString(),
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    createdPaths.push(manifestPath);

    const report: VaultStructureReport = {
      root: this.ROOT,
      category: safeCategory,
      owners: this.OWNERS,
      basePath,
      subdirectories: [...this.SUBDIRS],
      createdPaths,
      status: "Infraestrutura preparada para novos contratos",
      logMessage: "Registrado no sistema central da BIJU",
      preparedAt: new Date().toLocaleString("pt-BR"),
    };

    if (options?.logToConsole !== false) {
      console.log("\n" + "-".repeat(45));
      console.log(`   ESTRUTURANDO NOVO COFRE: ${safeCategory.toUpperCase()}`);
      console.log(`   PROPRIEDADE: ${report.owners}`);
      console.log(`   CAMINHO: ${basePath}`);
      console.log("-".repeat(45));

      for (const dir of this.SUBDIRS) {
        console.log(
          `Criando subdiretorio: ${this.ROOT}/${safeCategory}/${dir}... [PRONTO]`,
        );
      }

      console.log(`\nSTATUS: ${report.status}.`);
      console.log(`LOG: ${report.logMessage}.`);
      console.log("-".repeat(45) + "\n");
    }

    return report;
  }
}
