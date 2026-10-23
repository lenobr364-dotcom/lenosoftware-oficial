/**
 * Selagem geo-identidade (CEP oficial)
 * Uso: npx tsx scripts/nexus-geo-identity.ts
 */

import { NexusGeoIdentity } from "../lib/nexus-geo-identity";

async function main() {
  // === EXECUTANDO A SELAGEM GEOGRÁFICA ===
  const { report, filePath } = await NexusGeoIdentity.hardenAndPersist();
  console.log(`Geo: ${filePath}`);
  console.log(`CEP validado: ${report.cepValidated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
