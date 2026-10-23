/**
 * Lab Digital Gemini + protocolo NEXUS (bancada ChemVault Global).
 * Uso: npx tsx scripts/gemini-lab-thermal-simulation.ts
 */

import { ChemVaultNexus } from "../lib/chemvault-nexus";
import { ChemVaultRevenue, type FormulaBatch } from "../lib/chemvault-revenue";
import { ChemicalSimulator, type SimulationParams } from "../lib/gemini-lab-thermal";
import { NexusVisualEngine } from "../lib/nexus-visual-engine";

const formulaTeste: SimulationParams = {
  formulaName: "ChemVault_Alfa_Limpeza",
  density: 1.05,
  currentTempCelsius: 24.5,
  flashPointCelsius: 38.0,
};

console.log("==================================================");
console.log("EXECUTANDO COMANDO NO LABORATORIO DIGITAL GEMINI");
console.log(`Formula: ${formulaTeste.formulaName}`);
console.log("==================================================");

const resultado = ChemicalSimulator.executeThermalAnalysis(formulaTeste);

console.log(`Temp. Atual: ${formulaTeste.currentTempCelsius} C | ${resultado.tempFahrenheit}`);
console.log(`Ponto de Fulgor: ${formulaTeste.flashPointCelsius} C | ${resultado.flashPointFahrenheit}`);
console.log(`Margem de Seguranca: ${resultado.thermalMarginCelsius} C`);
console.log(`Indice de Estabilidade: ${resultado.safetyIndex}`);
console.log(`STATUS DA PROVETA: [ ${resultado.status} ]`);
console.log("==================================================");

console.log("\n--- INICIANDO PROTOCOLO NEXUS ---");
const auditoria = ChemVaultNexus.processLicensing(resultado);

console.log(`ID da Licenca: ${auditoria.licenseID}`);
console.log(`Aprovado para Venda? ${auditoria.isApproved ? "SIM" : "NAO"}`);
console.log(`Parecer Tecnico: ${auditoria.reason}`);
console.log(`Horario do Registro: ${auditoria.timestamp}`);

NexusVisualEngine.renderDashboard(auditoria, resultado);

const loteAtual: FormulaBatch = {
  batchId: "BATCH-ALFA-001",
  formulaName: formulaTeste.formulaName,
  costPerLicense: 24_500.0,
  operationalCost: 1_850.0,
};

ChemVaultRevenue.processLabProfit(auditoria, loteAtual);
