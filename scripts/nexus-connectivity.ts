/**
 * Uplink Starlink e Neural Link sync
 * Uso: npx tsx scripts/nexus-connectivity.ts
 */

import { NexusConnectivity } from "../lib/nexus-connectivity";

async function main() {
  // === EXECUTANDO A OTIMIZAÇÃO DE COMUNICAÇÃO ===
  const { report, filePath } = await NexusConnectivity.optimizeAndPersist();
  console.log(`Connectivity: ${filePath}`);
  console.log(`Streams: ${report.networkStreams.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
