/**
 * Emissao de laudo tecnico / ficha de seguranca
 * Uso: npx tsx scripts/nexus-compliance-office.ts
 */

import { ChemVaultNexus } from "../lib/chemvault-nexus";
import { NexusComplianceOffice } from "../lib/nexus-compliance-office";
import { NexusIPProtection } from "../lib/nexus-ip-protection";
import { ThermalService } from "../lib/thermal-service";

async function main() {
  console.log("\n--- EXECUTANDO EMISSAO DE LAUDO ---");

  const formulaName = "CV-Polymer-X";
  const ipTag = NexusIPProtection.mintAssetTag("CV-POLYMER-X", false);
  const result = ThermalService.analyze({
    id: "CV-POLYMER-X",
    substance: formulaName,
    viscosity_g_cm3: 1.5,
    criticalFlashPointC: 110,
    ambientTempC: 30,
  });
  const audit = ChemVaultNexus.processLicensing(result);

  const doc = NexusComplianceOffice.generateSafetySheet("NX-4348454D5641554C", formulaName, {
    audit,
    result,
    ipTag,
  });

  const filePath = await NexusComplianceOffice.persistSafetySheet(doc);
  console.log(`Laudo arquivado: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
