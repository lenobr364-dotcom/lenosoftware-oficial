/**
 * Fachada térmica do Lab Digital — mapeia FormulaData para ChemicalSimulator.
 */

import { ChemicalSimulator, type SimulationResult } from "@/lib/gemini-lab-thermal";
import type { FormulaData } from "@/lib/nexus-formula-data";

export class ThermalService {
  static readonly DEFAULT_AMBIENT_C = 25;

  static analyze(formula: FormulaData): SimulationResult {
    return ChemicalSimulator.executeThermalAnalysis({
      formulaName: `${formula.id} · ${formula.substance}`,
      density: formula.viscosity_g_cm3,
      currentTempCelsius: formula.ambientTempC ?? this.DEFAULT_AMBIENT_C,
      flashPointCelsius: formula.criticalFlashPointC,
    });
  }
}
