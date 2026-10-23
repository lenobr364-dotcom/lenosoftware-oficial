/**
 * Consolidacao global e handover
 * Uso: npx tsx scripts/nexus-global-summary.ts
 */

import { NexusGlobalSummary } from "../lib/nexus-global-summary";
import { NexusLegalRefactor } from "../lib/nexus-legal-refactor";

async function main() {
  console.log("\n--- CONSOLIDANDO O IMPERIO ---");
  NexusLegalRefactor.refactorIdentity(false);
  const report = NexusGlobalSummary.executeFinalCheck();
  const filePath = await NexusGlobalSummary.persistSummary(report);
  console.log(`Handover: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
