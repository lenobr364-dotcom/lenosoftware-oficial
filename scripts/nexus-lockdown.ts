/**
 * Fechamento de bancada — lockdown seguro
 * Uso: npx tsx scripts/nexus-lockdown.ts
 */

import { NexusLockdown } from "../lib/nexus-lockdown";

async function main() {
  console.log("\n--- EXECUTANDO O FECHAMENTO DE BANCADA ---");
  const report = await NexusLockdown.executeLockdown({ persist: true });
  console.log(`Standby: ${report.standbyMode} · ${report.lockedAt}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
