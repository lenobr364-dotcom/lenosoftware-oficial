/**
 * Pulso cinetico da vitrine Nexus
 * Uso: npx tsx scripts/nexus-kinetic-stream.ts
 */

import { NexusKineticStream } from "../lib/nexus-kinetic-stream";

async function main() {
  console.log("\n--- EXECUTANDO O PULSO DA VITRINE ---");
  const report = NexusKineticStream.startKineticFlow();
  const filePath = await NexusKineticStream.persistStreamState(report);
  console.log(`KDS: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
