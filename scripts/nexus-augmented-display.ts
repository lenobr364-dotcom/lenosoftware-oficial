/**
 * RTAD — vitrine realista do laboratorio
 * Uso: npx tsx scripts/nexus-augmented-display.ts
 */

import { NexusAugmentedDisplay } from "../lib/nexus-augmented-display";
import { NexusVisualRenderer } from "../lib/nexus-visual-renderer";

async function main() {
  console.log("\n--- LIGANDO A VITRINE REALISTA ---");
  const labView = NexusVisualRenderer.getLaboratoryMeta();
  const report = NexusAugmentedDisplay.bootVisualInterface(labView);
  const filePath = await NexusAugmentedDisplay.persistDisplayState(report);
  console.log(`RTAD: ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
