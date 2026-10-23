/**
 * Infraestrutura global ChemVault (deep-dive)
 * Uso: npx tsx scripts/nexus-global-empire.ts
 */

import { NexusGeoIdentity } from "../lib/nexus-geo-identity";
import { NexusGlobalEmpire } from "../lib/nexus-global-empire";
import { NexusHQManager } from "../lib/nexus-hq-manager";

async function main() {
  await NexusHQManager.syncAndPersist({ logToConsole: false });
  await NexusGeoIdentity.hardenAndPersist({ logToConsole: false });

  // === EXECUTANDO A CONSTRUÇÃO DO IMPÉRIO ===
  const { report, filePath } = await NexusGlobalEmpire.buildAndPersist();
  console.log(`Empire: ${filePath}`);
  console.log(`Modulos: ${report.coreModules.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
