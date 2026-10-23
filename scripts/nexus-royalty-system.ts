/**
 * Fechamento mensal de royalties por ativo
 * Uso: npx tsx scripts/nexus-royalty-system.ts
 */

import { NexusRoyaltySystem } from "../lib/nexus-royalty-system";

async function main() {
  console.log("\n--- SIMULANDO O FECHAMENTO DO MES PARA UM ATIVO ---");
  const report = NexusRoyaltySystem.trackRoyalties("NX-4348454D5641554C", 5000);
  const filePath = await NexusRoyaltySystem.persistRoyaltyReport(report);
  console.log(`Royalties: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
