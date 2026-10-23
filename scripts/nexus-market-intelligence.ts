/**
 * Mapa de calor global + blindagem de PI
 * Uso: npx tsx scripts/nexus-market-intelligence.ts
 */

import { NexusGlobalMarket } from "../lib/nexus-global-market";
import { NexusIPProtection } from "../lib/nexus-ip-protection";
import { NexusMarketIntelligence } from "../lib/nexus-market-intelligence";

async function main() {
  // === EXECUTANDO O PROTOCOLO DE ELITE ===
  NexusMarketIntelligence.activateMarketAnalysis();

  const ipTag = NexusIPProtection.mintAssetTag("CV6-GLOBAL-DEMO", false);
  const intl = NexusGlobalMarket.processInternationalLicense(
    "CV6-GLOBAL-DEMO",
    1200,
    "EUR",
    false,
  );

  const { filePath } = await NexusMarketIntelligence.activateAndPersist({
    ipTags: [ipTag],
    international: intl,
    logToConsole: false,
  });
  console.log(`Heatmap persistido: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
