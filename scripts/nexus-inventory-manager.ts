/**
 * Auditoria de materia-prima e estoque
 * Uso: npx tsx scripts/nexus-inventory-manager.ts
 */

import { NexusInventoryManager } from "../lib/nexus-inventory-manager";

async function main() {
  console.log("\n--- EXECUTANDO AUDITORIA DE MATERIAIS ---");
  const report = NexusInventoryManager.checkStockLevels();
  const filePath = await NexusInventoryManager.persistAudit(report);
  console.log(`Inventario: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
