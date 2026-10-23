/**
 * Validacao soberana da sociedade ChemVault
 * Uso: npx tsx scripts/nexus-society-core.ts
 */

import { NexusSocietyCore } from "../lib/nexus-society-core";

async function main() {
  console.log("\n--- EXECUTANDO VALIDACAO SOBERANA ---");
  const report = NexusSocietyCore.validateSocietyStatus();
  const filePath = await NexusSocietyCore.persistSocietyReport(report);
  console.log(`Relatorio: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
