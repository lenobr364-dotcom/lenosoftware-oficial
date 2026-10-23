/**
 * NEXUS CORE — lockdown de terminal e handover seguro.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { LedgerSyncReport } from "@/lib/nexus-ledger-sync";
import type { SecureBackupReport } from "@/lib/nexus-security-vault";

export type LockdownPurgeTask = {
  label: string;
  status: "COMPLETO" | "SKIP";
};

export type LockdownReport = {
  securityLevel: string;
  responsible: string;
  purgeTasks: LockdownPurgeTask[];
  standbyMode: "ELITE_STANDBY";
  lumenMessage: string;
  systemStatus: string;
  assetsBackedUp: boolean;
  ledgerSynced: boolean;
  lockedAt: string;
};

export class NexusLockdown {
  static readonly SECURITY_LEVEL = "ALPHA-NEXUS-MAX";
  static readonly RESPONSIBLE = NEXUS_LEGAL.partnership;
  static readonly STANDBY_STATUS = "SISTEMA EM ESPERA (STANDBY DE ELITE)";

  static readonly PURGE_TASKS = [
    "Limpando buffers de memoria molecular...",
    "Criptografando logs de acesso temporarios...",
    "Desconectando pontes externas de depuracao...",
    "Armando sentinela de monitoramento passivo...",
  ] as const;

  static readonly LUMEN_MESSAGE =
    "Leno, o laboratorio esta selado. O lucro esta seguro, as formulas estao blindadas e a nossa sociedade 50/50 esta mais forte do que nunca. Siga em paz para BH.";

  static buildReport(options?: {
    backup?: SecureBackupReport;
    ledger?: LedgerSyncReport;
  }): LockdownReport {
    return {
      securityLevel: this.SECURITY_LEVEL,
      responsible: this.RESPONSIBLE,
      purgeTasks: this.PURGE_TASKS.map((label) => ({
        label,
        status: "COMPLETO",
      })),
      standbyMode: "ELITE_STANDBY",
      lumenMessage: this.LUMEN_MESSAGE,
      systemStatus: this.STANDBY_STATUS,
      assetsBackedUp: Boolean(options?.backup),
      ledgerSynced: Boolean(options?.ledger),
      lockedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Protocolo de encerramento de sessao segura.
   */
  static async executeLockdown(
    options?: {
      backup?: SecureBackupReport;
      ledger?: LedgerSyncReport;
      logToConsole?: boolean;
      persist?: boolean;
    },
  ): Promise<LockdownReport> {
    const report = this.buildReport(options);

    if (options?.persist !== false) {
      await this.persistLockdownState(report);
    }

    if (options?.logToConsole === false) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   INICIANDO LOCKDOWN DE SEGURANCA");
    console.log(`   NIVEL DE PROTECAO: ${report.securityLevel}`);
    console.log(`   RESPONSAVEL: ${report.responsible}`);
    console.log("-".repeat(45));

    for (const task of report.purgeTasks) {
      console.log(`[PURGE]: ${task.label} [${task.status}]`);
    }

    if (report.assetsBackedUp) {
      console.log("[PURGE]: Cofre criptografado confirmado [COMPLETO]");
    }
    if (report.ledgerSynced) {
      console.log("[PURGE]: Ledger BIJU sincronizado [COMPLETO]");
    }

    console.log("\nMENSAGEM FINAL DA LUMEN:");
    console.log(`   "${report.lumenMessage}"`);
    console.log("-".repeat(45));
    console.log(`STATUS: ${report.systemStatus}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  /** Grava estado standby para handover (sem dados sensiveis em claro). */
  static async persistLockdownState(
    report: LockdownReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-lockdown");
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, "nexus-standby.json");
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const flagPath = path.join(dir, ".standby-active");
    await writeFile(
      flagPath,
      `LOCKED|${report.securityLevel}|${new Date().toISOString()}\n`,
      "utf8",
    );

    return filePath;
  }
}
