/**
 * Pacto de exclusividade ChemVault — 100% lab / sociedade / BIJU
 * Uso: npx tsx scripts/chemvault-exclusivity.ts
 */

import { ChemVaultExclusivity } from "../lib/chemvault-exclusivity";

async function main() {
  console.log("\n--- EXECUTANDO O PACTO DE EXCLUSIVIDADE ---");
  await ChemVaultExclusivity.activatePrivateMode();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
