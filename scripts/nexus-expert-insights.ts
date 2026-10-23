/**
 * Consultoria automatica NEXUS — bancada / lote
 * Uso: npx tsx scripts/nexus-expert-insights.ts
 */

import { ChemVaultNexus } from "../lib/chemvault-nexus";
import { NexusExpertInsights } from "../lib/nexus-expert-insights";
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

console.log("\n--- EXECUTANDO CONSULTORIA AUTOMATICA ---");

for (const formula of loteDeHoje) {
  const resultado = ThermalService.analyze(formula);
  const auditoria = ChemVaultNexus.processLicensing(resultado);
  console.log(`\n[${formula.id}] ${formula.substance}`);
  NexusExpertInsights.renderExpertLaudo(auditoria, resultado);
}

// Parecer de bancada na primeira formula (equivalente ao snippet do utilizador)
const formula = loteDeHoje[0]!;
const resultado = ThermalService.analyze(formula);
const auditoria = ChemVaultNexus.processLicensing(resultado);
console.log("--- ULTIMO RESULTADO DE BANCADA (elite) ---");
NexusExpertInsights.renderExpertLaudo(auditoria, resultado);
