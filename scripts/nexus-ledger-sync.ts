/**
 * Sincronia final do dia — ledger BIJU
 * Uso: npx tsx scripts/nexus-ledger-sync.ts
 */

import { NexusLedgerSync } from "../lib/nexus-ledger-sync";

async function main() {
  console.log("\n--- EXECUTANDO SINCRONIA FINAL ---");
  const report = await NexusLedgerSync.syncWorkday();
  const filePath = await NexusLedgerSync.persistSyncReport(report);
  console.log(`Ledger: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
