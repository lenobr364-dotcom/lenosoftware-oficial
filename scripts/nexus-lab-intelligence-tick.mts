/**
 * Tick de automação do laboratório — executar via cron / Task Scheduler.
 *
 *   set CHEMVAULT_LAB_AGENT_SECRET=...
 *   npx tsx scripts/nexus-lab-intelligence-tick.mts
 *   npx tsx scripts/nexus-lab-intelligence-tick.mts --force
 */

import { runAutomationTick } from "../lib/lab/intelligence/automation-runner";

const force = process.argv.includes("--force");

async function main() {
  if (!process.env.CHEMVAULT_LAB_AGENT_SECRET?.trim()) {
    console.warn("[lab-intelligence] CHEMVAULT_LAB_AGENT_SECRET unset — running tick in-process anyway.");
  }

  const result = await runAutomationTick(force);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
