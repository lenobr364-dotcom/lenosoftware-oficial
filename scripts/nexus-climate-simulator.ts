/**
 * Teste de estresse climatico preditivo
 * Uso: npx tsx scripts/nexus-climate-simulator.ts
 */

import { NexusClimateSimulator } from "../lib/nexus-climate-simulator";

async function main() {
  console.log("\n--- EXECUTANDO TESTE DE ESTRESSE CLIMATICO ---");

  const report = NexusClimateSimulator.runClimateTest("NX-4348454D5641554C", {
    id: "CV-POLYMER-X",
    substance: "CV-Polymer-X",
    viscosity_g_cm3: 1.5,
    criticalFlashPointC: 110,
  });

  const filePath = await NexusClimateSimulator.persistClimateTest(report);
  console.log(`Relatorio climatico: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
