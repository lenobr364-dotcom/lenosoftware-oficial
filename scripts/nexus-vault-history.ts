/**
 * Registro no cofre Gemini — histórico do lote
 * Uso: npx tsx scripts/nexus-vault-history.ts
 */

import { ChemVaultNexus } from "../lib/chemvault-nexus";
import { NexusExpertInsights } from "../lib/nexus-expert-insights";
import { NexusHistoryManager } from "../lib/nexus-history-manager";
import type { FormulaData } from "../lib/nexus-formula-data";
import { ThermalService } from "../lib/thermal-service";

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
  NexusHistoryManager.clearVault();

  console.log("\n--- EXECUTANDO REGISTRO NO COFRE ---");
  loteDeHoje.forEach((f) => {
    const res = ThermalService.analyze(f);
    const aud = ChemVaultNexus.processLicensing(res);
    NexusHistoryManager.saveToVault(f, aud, res);
    NexusExpertInsights.renderExpertLaudo(aud, res);
  });

  NexusHistoryManager.showVaultSummary();

  const filePath = await NexusHistoryManager.persistVault();
  console.log(`Cofre persistido: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
