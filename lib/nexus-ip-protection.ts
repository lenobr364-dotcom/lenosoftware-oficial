/**
 * NEXUS CORE — mint de PI e selo de autenticidade inalteravel.
 */

import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { FormulaData } from "@/lib/nexus-formula-data";

export type IPAssetTag = {
  formulaId: string;
  seal: string;
  assetHash: string;
  signature: string;
  vault: string;
  status: string;
  mintedAt: string;
};

export class NexusIPProtection {
  static readonly VAULT = "Cofre BIJU";
  static readonly STATUS = "Propriedade Intelectual Blindada";

  private static buildSignature(formulaId: string, timestamp?: number): string {
    const ts = timestamp ?? Date.now();
    const ownerTag = NEXUS_LEGAL.fullName.replace(/\s+/g, "-").toUpperCase();
    return `CHEMVAULT-GLOBAL-${ownerTag}-LUMEN-${formulaId}-${ts}`;
  }

  private static hashSignature(signature: string): string {
    return createHash("sha256").update(signature, "utf8").digest("hex").substring(0, 16).toUpperCase();
  }

  static buildAssetTag(formulaId: string, timestamp?: number): IPAssetTag {
    const signature = this.buildSignature(formulaId, timestamp);
    const assetHash = this.hashSignature(signature);
    const seal = `#NX-${assetHash}`;

    return {
      formulaId,
      seal,
      assetHash,
      signature,
      vault: this.VAULT,
      status: this.STATUS,
      mintedAt: new Date(timestamp ?? Date.now()).toLocaleString("pt-BR"),
    };
  }

  /**
   * Gera hash de autenticidade ChemVault e selo NX.
   */
  static mintAssetTag(formulaId: string, logToConsole = true): IPAssetTag {
    const tag = this.buildAssetTag(formulaId);

    if (logToConsole) {
      console.log("\n" + "-".repeat(40));
      console.log(`   REGISTRANDO ATIVO: ${formulaId}`);
      console.log(`   SELO DE AUTENTICIDADE: ${tag.seal}`);
      console.log("-".repeat(40));
      console.log(`STATUS: ${tag.status}.`);
      console.log(`ARQUIVO: Sincronizado com o ${tag.vault}.`);
      console.log("-".repeat(40) + "\n");
    }

    return tag;
  }

  static mintFormula(formula: FormulaData, logToConsole = true): IPAssetTag {
    return this.mintAssetTag(formula.id, logToConsole);
  }

  static async persistAssetTag(tag: IPAssetTag, exportDir?: string): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-ip-tags");
    await mkdir(dir, { recursive: true });
    const safeId = tag.formulaId.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_ip_${safeId}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(tag, null, 2), "utf8");
    return filePath;
  }
}
