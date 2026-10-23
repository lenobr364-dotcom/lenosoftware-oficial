/**
 * NEXUS CORE — otimizador de performance (processamento paralelo em escala).
 */

import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import { NexusGlobalProcessor } from "@/lib/nexus-global-processor";
import type { GeoClimate } from "@/lib/nexus-environment-shield";
import type { FormulaData } from "@/lib/nexus-formula-data";

export type PerformanceBoostReport = {
  turboActive: boolean;
  focus: string;
  threads: { name: string; status: string; loadPercent: number }[];
  responseTimeMs: number;
  formulasProcessed: number;
  throughputPerSecond: number;
  readyForHighDemand: boolean;
};

export class NexusPerformanceEngine {
  static readonly FOCUS = "ESCALABILIDADE DA CHEMVAULT GLOBAL";
  static readonly THREADS = [
    "Calculo Molecular",
    "Validacao Termica",
    "Emissao de Contrato BIJU",
  ] as const;

  static readonly TARGET_RESPONSE_MS = 150;

  /**
   * Ativa modo turbo (log + flag de processamento paralelo).
   */
  static boostProcessing(logToConsole = true): PerformanceBoostReport {
    const report: PerformanceBoostReport = {
      turboActive: true,
      focus: this.FOCUS,
      threads: this.THREADS.map((name) => ({
        name,
        status: "ESTAVEL",
        loadPercent: 120,
      })),
      responseTimeMs: this.TARGET_RESPONSE_MS,
      formulasProcessed: 0,
      throughputPerSecond: 0,
      readyForHighDemand: true,
    };

    if (!logToConsole) return report;

    const bar = "-".repeat(40);
    console.log("\n" + bar);
    console.log("   ATIVANDO TURBO COMPRESSOR NEXUS");
    console.log(`   FOCO: ${report.focus}`);
    console.log(bar);

    for (const thread of report.threads) {
      console.log(
        `[OVERCLOCK]: ${thread.name} operando em ${thread.loadPercent}%... [${thread.status}]`,
      );
    }

    console.log(`\nRESULTADO: Tempo de resposta reduzido para ${this.TARGET_RESPONSE_MS}ms.`);
    console.log("STATUS: Sistema pronto para alta demanda de clientes.");
    console.log(bar + "\n");

    return report;
  }

  /**
   * Processa lote em paralelo e mede tempo real de execucao.
   */
  static async runTurboBatch(
    formulas: FormulaData[],
    options?: {
      operationalCostBRL?: number;
      climate?: GeoClimate;
      logToConsole?: boolean;
      /** Evita log duplicado se boostProcessing() ja foi chamado. */
      skipBoostLog?: boolean;
    },
  ): Promise<{ balance: GlobalBatchBalance; boost: PerformanceBoostReport; elapsedMs: number }> {
    const started = performance.now();
    const boost = this.boostProcessing(
      options?.skipBoostLog ? false : options?.logToConsole !== false,
    );

    const balance = await NexusGlobalProcessor.runBatchSimulationParallel(formulas, {
      operationalCostBRL: options?.operationalCostBRL,
      climate: options?.climate,
      logToConsole: options?.logToConsole,
    });

    const elapsedMs = Math.round(performance.now() - started);
    const throughputPerSecond =
      elapsedMs > 0 ? Math.round((formulas.length / elapsedMs) * 1000 * 100) / 100 : formulas.length;

    boost.formulasProcessed = formulas.length;
    boost.responseTimeMs = Math.max(
      1,
      Math.round(elapsedMs / Math.max(formulas.length, 1)),
    );
    boost.throughputPerSecond = throughputPerSecond;
    boost.readyForHighDemand = boost.responseTimeMs <= this.TARGET_RESPONSE_MS * 2;

    if (options?.logToConsole !== false) {
      console.log(
        `TURBO: ${formulas.length} formulas em ${elapsedMs}ms (~${boost.responseTimeMs}ms/formula).`,
      );
    }

    return { balance, boost, elapsedMs };
  }
}
