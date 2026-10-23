/**
 * Valoracao de ativo e contrato inteligente
 * Uso: npx tsx scripts/nexus-smart-finance.ts
 */

import { NexusSmartFinance } from "../lib/nexus-smart-finance";

async function main() {
  console.log("\n--- EXECUTANDO VALORACAO DE ATIVO ---");

  const contract = NexusSmartFinance.generateContract("CV-Polymer-X", 2.5, {
    formulaCode: "CV-Polymer-X",
  });

  const filePath = await NexusSmartFinance.persistContract(contract);
  console.log(`Contrato arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
