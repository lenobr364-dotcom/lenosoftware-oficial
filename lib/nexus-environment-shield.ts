/**
 * NEXUS CORE — escudo de ambiente ao vivo (correção térmica por clima real).
 */

import { ChemVaultNexus, type LicenseAudit } from "@/lib/chemvault-nexus";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";

export interface GeoClimate {
  location: string;
  currentTempC: number;
  humidity: number;
}

export type ClimateCorrectionResult = {
  correctionFactor: number;
  baseSafetyIndex: number;
  adjustedSafetyIndex: number;
  climate: GeoClimate;
};

export const CLIMATE_PRESETS = {
  cuiaba: {
    location: "Cuiaba, MT",
    currentTempC: 30,
    humidity: 45,
  } satisfies GeoClimate,
} as const;

export class NexusEnvironmentShield {
  /** Temperatura acima da qual o risco de fulgor aumenta (sol forte). */
  static readonly HOT_CLIMATE_THRESHOLD_C = 30;
  static readonly HOT_CLIMATE_FACTOR = 1.15;

  private static parseSafetyIndex(safetyIndex: string): number {
    const value = parseFloat(safetyIndex.replace("%", "").trim());
    return Number.isFinite(value) ? value : 0;
  }

  static getCorrectionFactor(climate: GeoClimate): number {
    return climate.currentTempC > this.HOT_CLIMATE_THRESHOLD_C ? this.HOT_CLIMATE_FACTOR : 1.0;
  }

  /**
   * Aplica fator de correção térmica baseado no clima local.
   */
  static applyClimateCorrection(
    result: SimulationResult,
    climate: GeoClimate,
    logToConsole = true,
  ): number {
    const correctionFactor = this.getCorrectionFactor(climate);
    const baseSafety = this.parseSafetyIndex(result.safetyIndex);
    const adjustedSafety = baseSafety / correctionFactor;

    if (logToConsole) {
      console.log(`\nSINCRONIA AMBIENTAL: [${climate.location}]`);
      console.log(`TEMPERATURA EXTERNA: ${climate.currentTempC} C | UMIDADE: ${climate.humidity}%`);
      console.log(`FATOR DE CORRECAO APLICADO: x${correctionFactor}`);
    }

    return parseFloat(adjustedSafety.toFixed(2));
  }

  static applyCorrection(
    result: SimulationResult,
    climate: GeoClimate,
    logToConsole = true,
  ): ClimateCorrectionResult {
    const correctionFactor = this.getCorrectionFactor(climate);
    const baseSafetyIndex = this.parseSafetyIndex(result.safetyIndex);
    const adjustedSafetyIndex = this.applyClimateCorrection(result, climate, logToConsole);

    return {
      correctionFactor,
      baseSafetyIndex,
      adjustedSafetyIndex,
      climate,
    };
  }

  /** Resultado térmico com índice ajustado pelo clima (para NEXUS / insights). */
  static withAdjustedResult(
    result: SimulationResult,
    adjustedSafetyIndex: number,
  ): SimulationResult {
    return {
      ...result,
      safetyIndex: adjustedSafetyIndex.toFixed(2),
    };
  }

  /**
   * Licenciamento NEXUS usando índice de segurança realista (pós-escudo).
   */
  static processShieldedLicensing(
    result: SimulationResult,
    climate: GeoClimate,
    logToConsole = true,
  ): { correction: ClimateCorrectionResult; audit: LicenseAudit; shieldedResult: SimulationResult } {
    const correction = this.applyCorrection(result, climate, logToConsole);
    const shieldedResult = this.withAdjustedResult(result, correction.adjustedSafetyIndex);
    const audit = ChemVaultNexus.processLicensing(shieldedResult);

    if (logToConsole) {
      console.log(`INDICE DE SEGURANCA REALISTA: ${correction.adjustedSafetyIndex}%`);
      console.log("-".repeat(50));
    }

    return { correction, audit, shieldedResult };
  }
}
