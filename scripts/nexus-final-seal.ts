/**
 * Auditoria final e selagem de expansao global
 * Uso: npx tsx scripts/nexus-final-seal.ts
 */

import { NexusFinalSeal } from "../lib/nexus-final-seal";

async function main() {
  // === EXECUTANDO A SELAGEM FINAL DO DIA ===
  const { report, filePath } = await NexusFinalSeal.sealAndPersist({
    referenceDate: new Date("2026-05-15"),
  });
  console.log(`Selo final: ${filePath}`);
  console.log(`Prontidao: ${report.expansion.externalMarketReadinessPercent}%`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
