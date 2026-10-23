/**
 * Fechamento de ouro — hibernacao quantica
 * Uso: npx tsx scripts/nexus-quantum-sleep.ts
 */

import { NexusQuantumSleep } from "../lib/nexus-quantum-sleep";

async function main() {
  console.log("\n--- EXECUTANDO O FECHAMENTO DE OURO ---");
  const snapshot = await NexusQuantumSleep.initiateDeepSleep();
  console.log(`Estado: chemvault-public/nexus-quantum/deep-sleep-state.json`);
  console.log(`Operador: ${snapshot.operator}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
