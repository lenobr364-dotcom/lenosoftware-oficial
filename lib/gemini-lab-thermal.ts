/**
 * Lab Digital Gemini — simulação térmica (ChemVault Global).
 */

export interface SimulationParams {
  formulaName: string;
  density: number;
  currentTempCelsius: number;
  flashPointCelsius: number;
}

export interface SimulationResult {
  status: "ESTÁVEL" | "ALERTA_CRÍTICO" | "RISCO_DE_FULGOR";
  tempFahrenheit: string;
  flashPointFahrenheit: string;
  thermalMarginCelsius: number;
  safetyIndex: string;
}

export class ChemicalSimulator {
  private static convertToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  public static executeThermalAnalysis(params: SimulationParams): SimulationResult {
    const { currentTempCelsius, flashPointCelsius, density } = params;
    const thermalMarginCelsius = flashPointCelsius - currentTempCelsius;
    const denom = flashPointCelsius !== 0 ? flashPointCelsius : 1;
    const rawSafety = (thermalMarginCelsius / denom) * 100 * (density > 0 ? density : 1);
    const safetyIndex = Math.min(Math.max(rawSafety, 0), 100).toFixed(2);

    let status: SimulationResult["status"] = "ESTÁVEL";
    if (thermalMarginCelsius <= 5) {
      status = "RISCO_DE_FULGOR";
    } else if (thermalMarginCelsius <= 15) {
      status = "ALERTA_CRÍTICO";
    }

    return {
      status,
      tempFahrenheit: `${this.convertToFahrenheit(currentTempCelsius).toFixed(2)} °F`,
      flashPointFahrenheit: `${this.convertToFahrenheit(flashPointCelsius).toFixed(2)} °F`,
      thermalMarginCelsius,
      safetyIndex: `${safetyIndex}%`,
    };
  }
}
