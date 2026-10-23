/**
 * Segregacao de dominio e purge do nucleo quimico
 * Uso: npx tsx scripts/nexus-pure-core.ts
 */

import { NexusPureCore } from "../lib/nexus-pure-core";

async function main() {
  // === RESTAURANDO A PUREZA DO SISTEMA ===
  const { report, filePath } = await NexusPureCore.purgeAndPersist();
  console.log(`Pure core: ${filePath}`);
  console.log(`Quarentena: ${report.quarantinedPaths.length} path(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
