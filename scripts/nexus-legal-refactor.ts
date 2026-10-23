/**
 * Correcao de identidade juridica de elite
 * Uso: npx tsx scripts/nexus-legal-refactor.ts
 */

import { NexusLegalRefactor } from "../lib/nexus-legal-refactor";

async function main() {
  console.log("\n--- EXECUTANDO A CORRECAO DE ELITE ---");
  const report = NexusLegalRefactor.refactorIdentity();
  const filePath = await NexusLegalRefactor.persistRefactorReport(report);
  console.log(`Registro: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
