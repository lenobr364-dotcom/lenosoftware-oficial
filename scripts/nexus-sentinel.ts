/**
 * Sentinela stealth — vigilancia passiva
 * Uso: npx tsx scripts/nexus-sentinel.ts
 */

import { NexusLockdown } from "../lib/nexus-lockdown";
import { NexusSentinel } from "../lib/nexus-sentinel";

async function main() {
  console.log("\n--- EXECUTANDO A SENTINELA ---");

  await NexusLockdown.executeLockdown({ persist: true, logToConsole: false });
  const report = await NexusSentinel.activateSentinel();
  const filePath = await NexusSentinel.persistSentinelState(report);
  console.log(`Pulse: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
