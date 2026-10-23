/**
 * Gestao de lucro — reservas e dividendos
 * Uso: npx tsx scripts/nexus-financial-intelligence.ts
 */

import { CLIMATE_PRESETS } from "../lib/nexus-environment-shield";
import { NexusFinancialIntelligence } from "../lib/nexus-financial-intelligence";
import { NexusGlobalMarket } from "../lib/nexus-global-market";
import type { FormulaData } from "../lib/nexus-formula-data";
import { NexusPerformanceEngine } from "../lib/nexus-performance-engine";

const loteDeHoje: FormulaData[] = [
  {
    id: "CV6-A1",
    substance: "Detergente Industrial S",
    viscosity_g_cm3: 1.2,
    criticalFlashPointC: 85,
  },
  {
    id: "CV6-B2",
    substance: "Solvente Organico T-800",
    viscosity_g_cm3: 0.8,
    criticalFlashPointC: 42,
  },
  {
    id: "CV6-C3",
    substance: "Polimero Protetor X-9",
    viscosity_g_cm3: 1.5,
    criticalFlashPointC: 110,
  },
];

async function main() {
  console.log("\n--- EXECUTANDO GESTAO DE LUCRO ---");

  const { balance } = await NexusPerformanceEngine.runTurboBatch(loteDeHoje, {
    operationalCostBRL: 1_200,
    climate: CLIMATE_PRESETS.cuiaba,
    skipBoostLog: true,
  });

  const intl = NexusGlobalMarket.processInternationalLicense(
    "CV6-GLOBAL-01",
    1200,
    "EUR",
    false,
  );

  const report = NexusFinancialIntelligence.processFromBatch(
    balance,
    intl.valueBRL,
  );
  const filePath = await NexusFinancialIntelligence.persistRevenueCycle(report);
  console.log(`Ciclo arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
