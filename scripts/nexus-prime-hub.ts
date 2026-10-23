/**
 * NEXUS PRIME — decolagem autorizada
 * Uso: npx tsx scripts/nexus-prime-hub.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusGlobalProcessor } from "../lib/nexus-global-processor";
import { NexusPrimeHub } from "../lib/nexus-prime-hub";
import { NexusVisualRenderer } from "../lib/nexus-visual-renderer";

const loteDeHoje: FormulaData[] = [
  {
    id: "CV6-A1",
    substance: "Detergente Industrial S",
    viscosity_g_cm3: 1.2,
    criticalFlashPointC: 85,
  },
  {
    id: "CV6-B2",
    substance: "Solvente Organico T-800",
    viscosity_g_cm3: 0.8,
    criticalFlashPointC: 42,
  },
  {
    id: "CV6-C3",
    substance: "Polimero Protetor X-9",
    viscosity_g_cm3: 1.5,
    criticalFlashPointC: 110,
  },
];

console.log("\n--- DECOLAGEM AUTORIZADA ---");
NexusVisualRenderer.renderLaboratoryView(false);

const balance = NexusGlobalProcessor.runBatchSimulation(loteDeHoje, {
  operationalCostBRL: 1_200,
  climate: CLIMATE_PRESETS.cuiaba,
  logToConsole: false,
});

NexusGlobalProcessor.renderFinalBalance(balance);
NexusPrimeHub.activate(balance);
