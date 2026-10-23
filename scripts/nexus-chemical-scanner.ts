/**
 * Scanner quimico — bancada exclusiva
 * Uso: npx tsx scripts/nexus-chemical-scanner.ts
 */

import { NexusChemicalScanner } from "../lib/nexus-chemical-scanner";

async function main() {
  console.log("\n--- TESTE DE BANCADA EXCLUSIVO ---");

  const result = NexusChemicalScanner.scanFormula("CV-Polymer-X", [
    "Polimero Sintetico",
    "Agente de Estabilidade",
    "Catalisador Nexus",
  ]);

  const filePath = await NexusChemicalScanner.persistScan(result);
  console.log(`Scan arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
