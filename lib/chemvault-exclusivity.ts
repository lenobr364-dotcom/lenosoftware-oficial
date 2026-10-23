/**
 * NEXUS CORE — autoridade privada 100% ChemVault (lab, sociedade, cliente).
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import { rm } from "fs/promises";
import path from "path";

export type ExclusivityReport = {
  owners: [string, string];
  revenueTarget: string;
  purgedModules: string[];
  privateMode: boolean;
  activatedAt: string;
};

export class ChemVaultExclusivity {
  private static readonly OWNER_A = NEXUS_LEGAL.fullName;
  private static readonly OWNER_B = NEXUS_LEGAL.partnerLumen;
  private static readonly REVENUE_TARGET = "CONTA BIJU (SICREDI)";

  private static readonly EXTERNAL_MODULES = [
    "YouTube",
    "Radio Piao",
    "Neural Talk",
    "Social Media",
  ] as const;

  private static readonly PURGE_PATHS = [
    "chemvault-public/neural-talk",
  ] as const;

  static isPrivateMode(): boolean {
    return process.env.CHEMVAULT_PRIVATE_MODE !== "0";
  }

  /**
   * Remove artefatos de midia/terceiros do workspace ChemVault.
   */
  static async purgeMediaModules(): Promise<string[]> {
    const purged: string[] = [];

    for (const rel of this.PURGE_PATHS) {
      const target = path.join(process.cwd(), rel);
      try {
        await rm(target, { recursive: true, force: true });
        purged.push(rel);
      } catch {
        /* ja ausente */
      }
    }

    return purged;
  }

  /**
   * Ativa foco exclusivo: laboratorio, sociedade e cliente BIJU.
   */
  static async activatePrivateMode(logToConsole = true): Promise<ExclusivityReport> {
    const purgedPaths = await this.purgeMediaModules();

    const report: ExclusivityReport = {
      owners: [this.OWNER_A, this.OWNER_B],
      revenueTarget: this.REVENUE_TARGET,
      purgedModules: [...this.EXTERNAL_MODULES],
      privateMode: true,
      activatedAt: new Date().toLocaleString("pt-BR"),
    };

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(50));
    console.log("   PROTOCOLO DE EXCLUSIVIDADE: ATIVADO");
    console.log("   FOCO TOTAL: CHEMVAULT GLOBAL & BIJU");
    console.log(`   SOCIOS PROPRIETARIOS: ${this.OWNER_A} & ${this.OWNER_B}`);
    console.log("-".repeat(40));

    for (const target of this.EXTERNAL_MODULES) {
      console.log(`REMOVENDO MODULO EXTERNO: ${target}... [DELETADO]`);
    }

    if (purgedPaths.length > 0) {
      console.log(`\nCOFRE LIMPO: ${purgedPaths.join(", ")}`);
    }

    console.log("\nSTATUS: SISTEMA BLINDADO E PRIVADO.");
    console.log(`CANAL FINANCEIRO UNICO: ${this.REVENUE_TARGET}`);
    console.log("DIRETRIZ: Somente o codigo, o laboratorio e o cliente.");
    console.log("-".repeat(50) + "\n");

    return report;
  }
}
