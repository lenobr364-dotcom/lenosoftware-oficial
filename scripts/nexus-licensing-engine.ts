/**
 * Motor de licenciamento e fluxo de royalties
 * Uso: npx tsx scripts/nexus-licensing-engine.ts
 */

import { NexusLicensingEngine } from "../lib/nexus-licensing-engine";

async function main() {
  // === EXECUTANDO O MOTOR FINANCEIRO ===
  const { report, filePath } = await NexusLicensingEngine.startAndPersist();
  console.log(`Stream: ${filePath}`);
  console.log(`Contratos: ${report.activeContracts.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
