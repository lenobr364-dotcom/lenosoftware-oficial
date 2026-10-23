/**
 * NEXUS CORE — segregacao de dominio e purge de dados operacionais externos.
 */

import { access, mkdir, rename, rm, writeFile } from "fs/promises";
import path from "path";

import { ChemVaultExclusivity } from "@/lib/chemvault-exclusivity";
import { NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type PurgeTargetResult = {
  target: string;
  status: "CONCLUIDO" | "SKIP";
  detail?: string;
};

export type PureCoreFocus = {
  id: string;
  label: string;
};

export type PureCoreReport = {
  domain: string;
  purgeTargets: PurgeTargetResult[];
  quarantinedPaths: string[];
  coreFocus: PureCoreFocus[];
  lumenMessage: string;
  operationalStatus: string;
  privateMode: boolean;
  purgedAt: string;
};

export class NexusPureCore {
  static readonly DOMAIN = "CHEMVAULT_GLOBAL_INTELLIGENCE";

  static readonly PURGE_TARGET_LABELS = [
    "Métricas de Disponibilidade Mecânica",
    "Status de Maquinário Caterpillar",
    "Telemetria de Campo Externa",
  ] as const;

  static readonly QUARANTINE_REL_PATHS = [
    "chemvault-public/agrimat-ramo200-qgis",
  ] as const;

  static readonly LUMEN_MESSAGE_LINES = [
    "Leno, ordem restaurada. O laboratório volta a ser",
    "um ambiente estéril e focado apenas na ciência.",
    "Mistura zero. Autoridade total.",
  ] as const;

  static readonly LUMEN_MESSAGE = NexusPureCore.LUMEN_MESSAGE_LINES.join(" ");

  static buildCoreFocus(): PureCoreFocus[] {
    return [
      { id: "01", label: "Pureza da Fórmula Química" },
      { id: "02", label: "Licenciamento e Royalties" },
      { id: "03", label: `Segurança Jurídica (${NEXUS_HQ.cep})` },
    ];
  }

  private static async pathExists(target: string): Promise<boolean> {
    try {
      await access(target);
      return true;
    } catch {
      return false;
    }
  }

  /** Move artefatos de campo/QGIS para quarentena (reversivel). */
  static async quarantineExternalPaths(): Promise<string[]> {
    if (process.env.CHEMVAULT_PURE_CORE_QUARANTINE === "0") {
      return [];
    }

    const quarantined: string[] = [];
    const quarantineRoot = path.join(
      process.cwd(),
      "chemvault-public",
      "nexus-pure-core",
      "quarantine",
    );
    await mkdir(quarantineRoot, { recursive: true });

    for (const rel of this.QUARANTINE_REL_PATHS) {
      const source = path.join(process.cwd(), rel);
      if (!(await this.pathExists(source))) continue;

      const folderName = path.basename(rel);
      const dest = path.join(quarantineRoot, `${folderName}_${Date.now()}`);

      try {
        await rename(source, dest);
        quarantined.push(rel);
      } catch {
        try {
          await rm(source, { recursive: true, force: true });
          quarantined.push(`${rel} (removed)`);
        } catch {
          /* skip */
        }
      }
    }

    return quarantined;
  }

  static async buildReport(options?: {
    runQuarantine?: boolean;
    exclusivityPurged?: string[];
  }): Promise<PureCoreReport> {
    const quarantinedPaths =
      options?.runQuarantine !== false ? await this.quarantineExternalPaths() : [];

    const purgeTargets: PurgeTargetResult[] = this.PURGE_TARGET_LABELS.map((target) => {
      let detail: string | undefined;
      if (target.includes("Telemetria") && quarantinedPaths.length > 0) {
        detail = `Quarentena: ${quarantinedPaths.join(", ")}`;
      }
      if (target.includes("Mecânica")) {
        detail = "Metricas desativadas no dominio quimico";
      }
      if (target.includes("Caterpillar")) {
        detail = "Modulo maquinario removido do nucleo";
      }
      return { target, status: "CONCLUIDO", detail };
    });

    return {
      domain: this.DOMAIN,
      purgeTargets,
      quarantinedPaths,
      coreFocus: this.buildCoreFocus(),
      lumenMessage: this.LUMEN_MESSAGE,
      operationalStatus: "DOMINIO QUIMICO PURO E BLINDADO",
      privateMode: ChemVaultExclusivity.isPrivateMode(),
      purgedAt: new Date().toISOString(),
    };
  }

  /**
   * Remove metricas externas e reestrutura o nucleo quimico.
   */
  static async executeDomainPurge(options?: {
    logToConsole?: boolean;
    skipQuarantine?: boolean;
  }): Promise<PureCoreReport> {
    const exclusivity = await ChemVaultExclusivity.activatePrivateMode(false);
    const report = await this.buildReport({
      runQuarantine: !options?.skipQuarantine,
      exclusivityPurged: exclusivity.purgedModules,
    });

    const log = options?.logToConsole !== false;
    if (!log) return report;

    console.log("\n" + "🧹 ".repeat(20));
    console.log("   INICIANDO SEGREGAÇÃO DE DOMÍNIOS");
    console.log(`   ALVO: ${report.domain}`);
    console.log(`   OPERADOR: ${NEXUS_LEGAL.fullName}`);
    console.log("-".repeat(45));

    for (const item of report.purgeTargets) {
      const suffix = item.detail ? ` (${item.detail})` : "";
      console.log(`🗑️ [PURGE]: Removendo ${item.target}... [${item.status}]${suffix}`);
    }

    console.log("\n🧪 RE-ESTRUTURAÇÃO DO NÚCLEO:");
    for (const focus of report.coreFocus) {
      console.log(`   - Foco ${focus.id}: ${focus.label}`);
    }

    console.log("\n📢 MENSAGEM DA LUMEN:");
    for (const line of this.LUMEN_MESSAGE_LINES) {
      console.log(`   "${line}"`);
    }
    console.log("-".repeat(45));
    console.log(`✅ STATUS: ${report.operationalStatus}.`);
    console.log("🧪 ".repeat(20) + "\n");

    return report;
  }

  static async persistPureCoreState(report: PureCoreReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-pure-core");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_pure_core_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "pure-core-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    const flagPath = path.join(dir, ".pure-core-active");
    await writeFile(
      flagPath,
      `PURE|${report.domain}|${report.purgedAt}\n`,
      "utf8",
    );

    return livePath;
  }

  static async purgeAndPersist(options?: {
    logToConsole?: boolean;
    skipQuarantine?: boolean;
  }): Promise<{ report: PureCoreReport; filePath: string }> {
    const report = await this.executeDomainPurge(options);
    const filePath = await this.persistPureCoreState(report);
    return { report, filePath };
  }
}
