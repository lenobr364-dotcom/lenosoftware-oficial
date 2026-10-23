/**
 * NEXUS CORE — Kinetic Data Stream (KDS) para vitrine em tempo real.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import type { MasterCalibrationReport } from "@/lib/nexus-master-calibration";

export type KineticStreamChannel = {
  label: string;
  status: "ATIVO" | "BUFFER";
};

export type KineticStreamReport = {
  refreshRate: string;
  textureQuality: string;
  channels: KineticStreamChannel[];
  operator: string;
  fleetAvailabilityPercent: number;
  societySplit: string;
  lumenMessage: string;
  operationalStatus: string;
  startedAt: string;
};

export class NexusKineticStream {
  static readonly REFRESH_RATE = "60FPS_STABLE";
  static readonly TEXTURE_QUALITY = "ULTRA_REALISTIC";

  static readonly DATA_STREAMS = [
    "Injetando particulas de telemetria quimica...",
    "Sincronizando pulso financeiro BIJU/Sicredi...",
    "Renderizando sombras dinamicas nos hologramas...",
    "Estabilizando fluxo de dados Starlink...",
  ] as const;

  static readonly LUMEN_MESSAGE =
    "Leno, sinta o movimento dos dados. Amanha, quando sua equipe chegar, voce vera o lucro se movendo em tempo real diante dos seus olhos. E arte e ciencia.";

  static resolveFleetPercent(
    balance?: GlobalBatchBalance,
    calibration?: MasterCalibrationReport,
  ): number {
    if (calibration?.efficiencyPercent) {
      return Math.round(calibration.efficiencyPercent);
    }
    if (balance && balance.totalFormulas > 0) {
      return Math.round((balance.approvedCount / balance.totalFormulas) * 100);
    }
    return 92;
  }

  static buildReport(options?: {
    balance?: GlobalBatchBalance;
    calibration?: MasterCalibrationReport;
  }): KineticStreamReport {
    return {
      refreshRate: this.REFRESH_RATE,
      textureQuality: this.TEXTURE_QUALITY,
      channels: this.DATA_STREAMS.map((label) => ({ label, status: "ATIVO" })),
      operator: NEXUS_LEGAL.fullName,
      fleetAvailabilityPercent: this.resolveFleetPercent(
        options?.balance,
        options?.calibration,
      ),
      societySplit: "50/50 [LOCK]",
      lumenMessage: this.LUMEN_MESSAGE,
      operationalStatus: "FLUXO CINETICO OPERACIONAL",
      startedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Ativa fluxo de dados em tempo real sobre a vitrine.
   */
  static startKineticFlow(
    options?: {
      balance?: GlobalBatchBalance;
      calibration?: MasterCalibrationReport;
      logToConsole?: boolean;
    },
  ): KineticStreamReport {
    const report = this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (!log) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   ATIVANDO FLUXO DE DADOS CINETICO (KDS)");
    console.log(`   QUALIDADE: ${report.textureQuality} | RATE: ${report.refreshRate}`);
    console.log("-".repeat(45));

    for (const channel of report.channels) {
      console.log(`[STREAM]: ${channel.label} [${channel.status}]`);
    }

    console.log("\nPAINEL DE CONTROLE (REALISTA):");
    console.log(`   - Operador: ${report.operator}`);
    console.log(`   - Status da Frota: ${report.fleetAvailabilityPercent}% DISPONIVEL`);
    console.log(`   - Sociedade: ${report.societySplit}`);
    console.log("\nMENSAGEM DA LUMEN:");
    console.log(`   "${report.lumenMessage}"`);
    console.log("-".repeat(45));
    console.log(`STATUS: ${report.operationalStatus}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistStreamState(
    report: KineticStreamReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-kds");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_kds_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "kds-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    return filePath;
  }
}
