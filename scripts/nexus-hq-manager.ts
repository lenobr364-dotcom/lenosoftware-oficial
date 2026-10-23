/**
 * HQ-SYNC — unificação de sede BIJU / Sicredi
 * Uso: npx tsx scripts/nexus-hq-manager.ts
 */

import { NexusHQManager } from "../lib/nexus-hq-manager";

async function main() {
  // === EXECUTANDO UNIFICAÇÃO DE SEDE ===
  const { report, filePath } = await NexusHQManager.syncAndPersist();
  console.log(`HQ-SYNC: ${filePath}`);
  console.log(`Matriz: ${report.matrizAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
