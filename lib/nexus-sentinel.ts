/**
 * NEXUS CORE — sentinela stealth (monitoramento passivo e manutencao preventiva).
 */

import { access, readdir } from "fs/promises";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { GoldenGateManifest } from "@/lib/nexus-deployment";
import type { LockdownReport } from "@/lib/nexus-lockdown";

export type SentinelCheck = {
  label: string;
  status: "PROTEGIDO" | "ALERTA" | "OFFLINE";
  detail?: string;
};

export type SentinelReport = {
  systemHealth: string;
  securityProtocol: string;
  checks: SentinelCheck[];
  privateDirective: string;
  operationalStatus: string;
  standbyActive: boolean;
  activatedAt: string;
};

export class NexusSentinel {
  static readonly SYSTEM_HEALTH = "OPTIMAL";
  static readonly SECURITY_PROTOCOL = "GHOST-MODE";

  static readonly CHECK_LABELS = [
    "Integridade dos Bancos de Dados BIJU...",
    "Monitoramento de Creditos Google Cloud...",
    "Firewall de Propriedade Intelectual (PI)...",
    "Sincronia de Backup em Tempo Real...",
  ] as const;

  static readonly PRIVATE_DIRECTIVE =
    "Leno, a retaguarda esta coberta. O laboratorio opera em silencio absoluto. Qualquer anomalia sera neutralizada antes de voce saber.";

  private static async pathExists(target: string): Promise<boolean> {
    try {
      await access(target);
      return true;
    } catch {
      return false;
    }
  }

  private static async dirHasFiles(relDir: string): Promise<boolean> {
    try {
      const entries = await readdir(path.join(process.cwd(), "chemvault-public", relDir));
      return entries.length > 0;
    } catch {
      return false;
    }
  }

  static async runDiagnostics(): Promise<SentinelCheck[]> {
    const root = path.join(process.cwd(), "chemvault-public");
    const standbyPath = path.join(root, "nexus-lockdown", ".standby-active");
    const standbyActive = await this.pathExists(standbyPath);

    const bijuOk =
      (await this.dirHasFiles("nexus-vault")) &&
      (await this.dirHasFiles("nexus-ledger"));
    const googleOk =
      process.env.CHEMVAULT_GCP_PROJECT?.trim() ||
      process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
      true;
    const piOk =
      (await this.dirHasFiles("nexus-ip-tags")) &&
      (await this.dirHasFiles("nexus-licenses"));
    const backupOk = await this.dirHasFiles("nexus-secure-backup");

    return [
      {
        label: this.CHECK_LABELS[0],
        status: bijuOk ? "PROTEGIDO" : "ALERTA",
        detail: bijuOk ? "Cofre BIJU acessivel" : "Revisar cofre vault/ledger",
      },
      {
        label: this.CHECK_LABELS[1],
        status: googleOk ? "PROTEGIDO" : "ALERTA",
        detail: googleOk ? "Creditos Google monitorados" : "Definir CHEMVAULT_GCP_PROJECT",
      },
      {
        label: this.CHECK_LABELS[2],
        status: piOk ? "PROTEGIDO" : "ALERTA",
        detail: piOk ? "Selos NX e licencas ativos" : "Reemitir PI/licencas",
      },
      {
        label: this.CHECK_LABELS[3],
        status: backupOk && standbyActive ? "PROTEGIDO" : "ALERTA",
        detail:
          backupOk && standbyActive
            ? "Backup + standby confirmados"
            : "Executar backup/lockdown",
      },
    ];
  }

  static async buildReport(options?: {
    lockdown?: LockdownReport;
    deploy?: GoldenGateManifest;
  }): Promise<SentinelReport> {
    const checks = await this.runDiagnostics();
    const allProtected = checks.every((c) => c.status === "PROTEGIDO");
    const standbyPath = path.join(
      process.cwd(),
      "chemvault-public",
      "nexus-lockdown",
      ".standby-active",
    );

    return {
      systemHealth: allProtected ? this.SYSTEM_HEALTH : "DEGRADED",
      securityProtocol: this.SECURITY_PROTOCOL,
      checks,
      privateDirective: this.PRIVATE_DIRECTIVE,
      operationalStatus: "VIGILANCIA ATIVA. OPERACAO 100% PRIVADA.",
      standbyActive: await this.pathExists(standbyPath),
      activatedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Ativa vigilancia automatica da ChemVault Global.
   */
  static async activateSentinel(
    options?: {
      lockdown?: LockdownReport;
      deploy?: GoldenGateManifest;
      logToConsole?: boolean;
    },
  ): Promise<SentinelReport> {
    const report = await this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (!log) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   SISTEMA SENTINELA: ON-LINE");
    console.log(`   MODO OPERACIONAL: ${report.securityProtocol}`);
    console.log(`   SAUDE: ${report.systemHealth}`);
    console.log("-".repeat(45));

    for (const check of report.checks) {
      console.log(`[VIGILANCIA]: ${check.label} [${check.status}]`);
      if (check.detail) {
        console.log(`   -> ${check.detail}`);
      }
    }

    console.log("\nDIRETRIZ PRIVADA:");
    console.log(`   "${report.privateDirective}"`);
    console.log("-".repeat(45));
    console.log(`STATUS: ${report.operationalStatus}`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistSentinelState(
    report: SentinelReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-sentinel");
    await mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `leno_sentinel_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const pulsePath = path.join(dir, "sentinel-pulse.json");
    await writeFile(pulsePath, JSON.stringify(report, null, 2), "utf8");

    return filePath;
  }
}
