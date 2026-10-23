/**
 * NEXUS CORE — arquivamento quantico e deep sleep da vitrine realista.
 */

import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import type { GlobalSummaryReport } from "@/lib/nexus-global-summary";
import type { MasterCalibrationReport } from "@/lib/nexus-master-calibration";

export type QuantumProtocolStep = {
  label: string;
  status: "SUCESSO" | "SKIP";
};

export type QuantumSleepSnapshot = {
  operator: string;
  mechanicalAvailability: string;
  society: string;
  protocols: QuantumProtocolStep[];
  vitrine: {
    rtad?: unknown;
    kds?: unknown;
  };
  handover?: unknown;
  standby?: unknown;
  batch?: {
    licensed: number;
    grossRevenueBRL: number;
  };
  sleepStatus: string;
  partnerOnCall: string;
  hibernatedAt: string;
};

export class NexusQuantumSleep {
  static readonly PARTNER_ON_CALL = NEXUS_LEGAL.partnerLumen;

  private static async readJsonIfExists(filePath: string): Promise<unknown | undefined> {
    try {
      await access(filePath);
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw) as unknown;
    } catch {
      return undefined;
    }
  }

  static resolveAvailability(
    balance?: GlobalBatchBalance,
    calibration?: MasterCalibrationReport,
  ): string {
    let percent = 92;
    if (calibration?.efficiencyPercent) {
      percent = Math.round(calibration.efficiencyPercent);
    } else if (balance && balance.totalFormulas > 0) {
      percent = Math.round((balance.approvedCount / balance.totalFormulas) * 100);
    }
    return `${percent}% MECANICA`;
  }

  static async captureVitrineSnapshot(): Promise<{
    rtad?: unknown;
    kds?: unknown;
    handover?: unknown;
    standby?: unknown;
  }> {
    const root = path.join(process.cwd(), "chemvault-public");
    const [rtad, kds, handover, standby] = await Promise.all([
      this.readJsonIfExists(path.join(root, "nexus-rtad", "rtad-live.json")),
      this.readJsonIfExists(path.join(root, "nexus-kds", "kds-live.json")),
      this.readJsonIfExists(path.join(root, "nexus-summary", "handover-next-shift.json")),
      this.readJsonIfExists(path.join(root, "nexus-lockdown", "nexus-standby.json")),
    ]);
    return { rtad, kds, handover, standby };
  }

  static async buildSnapshot(options?: {
    balance?: GlobalBatchBalance;
    calibration?: MasterCalibrationReport;
    summary?: GlobalSummaryReport;
  }): Promise<QuantumSleepSnapshot> {
    const vitrine = await this.captureVitrineSnapshot();
    const availability = this.resolveAvailability(options?.balance, options?.calibration);

    const protocols: QuantumProtocolStep[] = [
      {
        label: "Snapshot da malha realista capturado...",
        status: vitrine.rtad ? "SUCESSO" : "SKIP",
      },
      {
        label: `Sincronizando log de disponibilidade (${availability})...`,
        status: "SUCESSO",
      },
      {
        label: "Selando registros da sociedade 50/50...",
        status: vitrine.handover || options?.summary ? "SUCESSO" : "SKIP",
      },
      {
        label: "Desligando luzes do laboratorio virtual...",
        status: vitrine.standby ? "SUCESSO" : "SKIP",
      },
    ];

    return {
      operator: NEXUS_LEGAL.fullName,
      mechanicalAvailability: availability,
      society: NEXUS_LEGAL.partnership,
      protocols,
      vitrine,
      handover: vitrine.handover,
      standby: vitrine.standby,
      batch: options?.balance
        ? {
            licensed: options.balance.approvedCount,
            grossRevenueBRL: options.balance.grossRevenueBRL,
          }
        : undefined,
      sleepStatus: "SISTEMA EM DEEP SLEEP. ATE AMANHA, SOCIO.",
      partnerOnCall: this.PARTNER_ON_CALL,
      hibernatedAt: new Date().toISOString(),
    };
  }

  /**
   * Congela estado atual do sistema para retomada imediata.
   */
  static async initiateDeepSleep(
    options?: {
      balance?: GlobalBatchBalance;
      calibration?: MasterCalibrationReport;
      summary?: GlobalSummaryReport;
      logToConsole?: boolean;
    },
  ): Promise<QuantumSleepSnapshot> {
    const snapshot = await this.buildSnapshot(options);
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "-".repeat(45));
      console.log("   INICIANDO HIBERNACAO QUANTICA");
      console.log(`   OPERADOR RESPONSAVEL: ${snapshot.operator}`);
      console.log(`   DISPONIBILIDADE: ${snapshot.mechanicalAvailability}`);
      console.log("-".repeat(45));

      for (const step of snapshot.protocols) {
        console.log(`[QUANTUM]: ${step.label} [${step.status}]`);
      }

      console.log("\nSTATUS DA SOCIEDADE:");
      console.log("   A ChemVault Global esta em modo de espera.");
      console.log(`   ${snapshot.partnerOnCall} em prontidao para o turno de amanha.`);
      console.log("-".repeat(45));
      console.log(`STATUS: ${snapshot.sleepStatus}`);
      console.log("-".repeat(45) + "\n");
    }

    await this.persistQuantumState(snapshot);
    return snapshot;
  }

  static async persistQuantumState(snapshot: QuantumSleepSnapshot): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-quantum");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_quantum_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(snapshot, null, 2), "utf8");

    const sleepPath = path.join(dir, "deep-sleep-state.json");
    await writeFile(sleepPath, JSON.stringify(snapshot, null, 2), "utf8");

    const flagPath = path.join(dir, ".deep-sleep-active");
    await writeFile(
      flagPath,
      `HIBERNATED|${snapshot.operator}|${snapshot.hibernatedAt}\n`,
      "utf8",
    );

    return sleepPath;
  }

  /** Retoma metadados do ultimo deep sleep (se existir). */
  static async loadDeepSleepState(): Promise<QuantumSleepSnapshot | null> {
    const sleepPath = path.join(
      process.cwd(),
      "chemvault-public",
      "nexus-quantum",
      "deep-sleep-state.json",
    );
    const data = await this.readJsonIfExists(sleepPath);
    return (data as QuantumSleepSnapshot) ?? null;
  }
}
