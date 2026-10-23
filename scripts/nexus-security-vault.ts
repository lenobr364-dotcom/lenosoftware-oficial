/**
 * Blindagem final — backup criptografado NEXUS
 * Uso: npx tsx scripts/nexus-security-vault.ts
 */

import { NexusSecurityVault } from "../lib/nexus-security-vault";

async function main() {
  console.log("\n--- EXECUTANDO BLINDAGEM FINAL ---");
  const report = await NexusSecurityVault.performSecureBackup();
  console.log(`Manifesto: ${report.manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
