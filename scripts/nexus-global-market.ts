/**
 * Mercado global — primeiro contrato exterior
 * Uso: npx tsx scripts/nexus-global-market.ts
 */

import { NexusGlobalMarket } from "../lib/nexus-global-market";

async function main() {
  console.log("\n--- PRIMEIRO CONTRATO EXTERIOR (PORTUGAL) ---");

  const result = NexusGlobalMarket.processInternationalLicense(
    "CV6-GLOBAL-01",
    1200,
    "EUR",
  );

  const filePath = await NexusGlobalMarket.persistTransaction(result);
  console.log(`Contrato arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
