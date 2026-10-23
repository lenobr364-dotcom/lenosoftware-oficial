import { NextRequest } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { getIntelligenceStatus } from "@/lib/services/lab-intelligence.service";

export const dynamic = "force-dynamic";

/** GET — snapshot operacional (agentes, processos, barramento, automação). */
export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  try {
    const data = await getIntelligenceStatus();
    return nexusLabJsonResponse({ ok: true, data, access: guard.mode }, { cache: "privateIntelligence" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "intelligence_status_failed";
    return nexusLabJsonResponse({ ok: false, error: message }, { status: 500, cache: "noStore" });
  }
}
