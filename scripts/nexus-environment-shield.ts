/**
 * Escudo ambiental ao vivo — exemplo Cuiaba
 * Uso: npx tsx scripts/nexus-environment-shield.ts
 */

import { CLIMATE_PRESETS, NexusEnvironmentShield } from "../lib/nexus-environment-shield";
import type { FormulaData } from "../lib/nexus-formula-data";
import { ThermalService } from "../lib/thermal-service";

const formulaBancada: FormulaData = {
  id: "CV6-A1",
  substance: "Detergente Industrial S",
  viscosity_g_cm3: 1.2,
  criticalFlashPointC: 85,
};

console.log("\n--- EXECUCAO EM CUIABA ---");
const resultado = ThermalService.analyze({
  ...formulaBancada,
  ambientTempC: CLIMATE_PRESETS.cuiaba.currentTempC,
});

const climaCuiaba = CLIMATE_PRESETS.cuiaba;
const segurancaRealista = NexusEnvironmentShield.applyClimateCorrection(resultado, climaCuiaba);
console.log(`INDICE DE SEGURANCA REALISTA: ${segurancaRealista}%`);
console.log("-".repeat(50));

const shielded = NexusEnvironmentShield.processShieldedLicensing(resultado, {
  ...climaCuiaba,
  currentTempC: 35,
});
console.log(`NEXUS (35 C): ${shielded.audit.isApproved ? "APROVADO" : "REJEITADO"} — ${shielded.audit.reason}`);
