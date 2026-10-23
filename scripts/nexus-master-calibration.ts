/**
 * Calibracao neural mestre — fechamento do dia NEXUS
 * Uso: npx tsx scripts/nexus-master-calibration.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import { NexusMasterCalibration } from "../lib/nexus-master-calibration";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusGlobalProcessor } from "../lib/nexus-global-processor";
import { NexusSecurityVault } from "../lib/nexus-security-vault";

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
  console.log("\n--- CALIBRACAO FINAL DE HOJE ---");

  const balance = NexusGlobalProcessor.runBatchSimulation(loteDeHoje, {
    climate: CLIMATE_PRESETS.cuiaba,
    logToConsole: false,
  });

  const backup = await NexusSecurityVault.performSecureBackup(false);
  NexusMasterCalibration.optimizeEngine(balance, backup);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
