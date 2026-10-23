/**
 * Cofre molecular e criptografia de formulas
 * Uso: npx tsx scripts/nexus-chemical-vault.ts
 */

import { NexusChemicalVault } from "../lib/nexus-chemical-vault";

async function main() {
  // === EXECUTANDO O FECHAMENTO DO COFRE ===
  const { report, filePath } = await NexusChemicalVault.initializeAndPersist();
  console.log(`Cofre: ${filePath}`);
  console.log(`Formulas seladas: ${report.formulas.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
