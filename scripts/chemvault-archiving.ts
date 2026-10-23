/**
 * Preparacao de cofre high-end para novos ativos
 * Uso: npx tsx scripts/chemvault-archiving.ts
 */

import { ChemVaultArchiving } from "../lib/chemvault-archiving";

async function main() {
  console.log("\n--- PREPARANDO O TERRENO PARA O PROXIMO GRANDE CONTRATO ---");
  const report = await ChemVaultArchiving.prepareNewVault("Polimeros_Alta_Performance");
  console.log(`Cofre criado em: ${report.basePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
