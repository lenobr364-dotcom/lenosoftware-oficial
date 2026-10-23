/**
 * Agente autonomo em plantao
 * Uso: npx tsx scripts/nexus-autonomous-agent.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import { NexusAutonomousAgent } from "../lib/nexus-autonomous-agent";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusGlobalProcessor } from "../lib/nexus-global-processor";

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
  console.log("\n--- ATIVANDO O AGENTE DE PLANTAO ---");

  const balance = NexusGlobalProcessor.runBatchSimulation(loteDeHoje, {
    climate: CLIMATE_PRESETS.cuiaba,
    logToConsole: false,
  });

  const report = NexusAutonomousAgent.startShiftFromBatch(balance);
  const filePath = await NexusAutonomousAgent.persistShiftReport(report);
  console.log(`Relatorio arquivado: ${filePath}`);

  console.log("\n--- SIMULACAO DIURNA (DEFAULT) ---");
  NexusAutonomousAgent.startShift();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
