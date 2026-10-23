/**
 * Otimizacao de rota multi-regiao
 * Uso: npx tsx scripts/nexus-network-optimizer.ts
 */

import { NexusNetworkOptimizer } from "../lib/nexus-network-optimizer";

async function main() {
  console.log("\n--- EXECUTANDO OTIMIZACAO DE ROTA ---");
  const report = NexusNetworkOptimizer.optimizeGateway("Mato Grosso / Minas Gerais");
  const filePath = await NexusNetworkOptimizer.persistGatewayReport(report);
  console.log(`Gateway: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
