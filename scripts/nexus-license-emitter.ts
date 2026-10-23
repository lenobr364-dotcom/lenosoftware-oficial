/**
 * Entrega final — licenca comercial global
 * Uso: npx tsx scripts/nexus-license-emitter.ts
 */

import { ChemVaultNexus } from "../lib/chemvault-nexus";
import { NexusLicenseEmitter } from "../lib/nexus-license-emitter";
import { NexusIPProtection } from "../lib/nexus-ip-protection";
import { NexusSmartFinance } from "../lib/nexus-smart-finance";
import { ThermalService } from "../lib/thermal-service";

async function main() {
  console.log("\n--- EXECUTANDO ENTREGA FINAL ---");

  const formula = {
    id: "CV-POLYMER-X",
    substance: "CV-Polymer-X",
    viscosity_g_cm3: 1.5,
    criticalFlashPointC: 110,
    ambientTempC: 30,
  };

  const result = ThermalService.analyze(formula);
  const audit = ChemVaultNexus.processLicensing(result);
  const ipTag = NexusIPProtection.buildAssetTag(formula.id);
  const contract = NexusSmartFinance.generateContract(formula.substance, 2.5, {
    formulaCode: formula.id,
    logToConsole: false,
  });

  const license = NexusLicenseEmitter.emitLicense(
    "INDUSTRIA QUIMICA GLOBAL",
    "NX-4348454D5641554C",
    { formula, audit, contract, ipTag, bijuConfirmed: true },
  );

  if (license) {
    const filePath = await NexusLicenseEmitter.persistLicense(license);
    console.log(`Licenca arquivada: ${filePath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
