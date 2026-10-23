/**
 * Golden Gate — salto final de publicacao
 * Uso: npx tsx scripts/nexus-deployment.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import { NexusDeployment } from "../lib/nexus-deployment";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusPerformanceEngine } from "../lib/nexus-performance-engine";
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
  console.log("\n--- EXECUTANDO O SALTO FINAL ---");

  const { balance } = await NexusPerformanceEngine.runTurboBatch(loteDeHoje, {
    climate: CLIMATE_PRESETS.cuiaba,
    operationalCostBRL: 1_200,
    skipBoostLog: true,
    logToConsole: false,
  });

  const backup = await NexusSecurityVault.performSecureBackup(false);
  const manifest = await NexusDeployment.executeFinalDeploy({ balance, backup });
  console.log(`Manifesto Golden Gate: ${manifest.serverTarget}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
