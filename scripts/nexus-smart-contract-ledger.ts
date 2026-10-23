/**
 * Ledger de contratos inteligentes + liquidacao em tempo real
 * Uso: npx tsx scripts/nexus-smart-contract-ledger.ts
 */

import { NexusSmartContract } from "../lib/nexus-smart-contract-ledger";
import { NexusSmartFinance } from "../lib/nexus-smart-finance";

async function main() {
  const demo = NexusSmartFinance.generateContract("CV-Polymer-X", 2.5, {
    formulaCode: "CV6-DEMO",
    logToConsole: false,
  });

  const { report, filePath } = await NexusSmartContract.activateAndSettle([demo]);
  console.log(`Ledger: ${filePath}`);
  console.log(`Liquidados: ${report.ledgerSummary.contractsSettled}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
