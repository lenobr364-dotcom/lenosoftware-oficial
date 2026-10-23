import { NextRequest } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { runAutomationTick } from "@/lib/services/lab-intelligence.service";

export const dynamic = "force-dynamic";

/**
 * POST — tick de rotinas em background (cron / worker externo).
 * Autenticação: Bearer CHEMVAULT_LAB_AGENT_SECRET
 */
export async function POST(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request, { allowAgentOnly: true });
  if (guard instanceof Response) return guard;

  const force = request.nextUrl.searchParams.get("force") === "1";

  try {
    const result = await runAutomationTick(force);
    return nexusLabJsonResponse({ ok: true, ...result }, { cache: "noStore" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "automation_tick_failed";
    return nexusLabJsonResponse({ ok: false, error: message }, { status: 500, cache: "noStore" });
  }
}
