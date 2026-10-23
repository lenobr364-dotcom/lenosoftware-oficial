/**
 * Turbo compressor NEXUS — processamento paralelo
 * Uso: npx tsx scripts/nexus-performance-engine.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusPerformanceEngine } from "../lib/nexus-performance-engine";

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

async function main() {
  console.log("\n--- EXECUTANDO O TURBO ---");
  NexusPerformanceEngine.boostProcessing();

  await NexusPerformanceEngine.runTurboBatch(loteDeHoje, {
    climate: CLIMATE_PRESETS.cuiaba,
    operationalCostBRL: 1_200,
    skipBoostLog: true,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
