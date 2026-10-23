/**
 * Registro de PI — selo de autenticidade
 * Uso: npx tsx scripts/nexus-ip-protection.ts
 */

import { NexusIPProtection } from "../lib/nexus-ip-protection";

async function main() {
  console.log("\n--- EXECUTANDO REGISTRO DE ELITE ---");

  const tag = NexusIPProtection.mintAssetTag("CV-POLYMER-X");
  const filePath = await NexusIPProtection.persistAssetTag(tag);
  console.log(`Selo arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
