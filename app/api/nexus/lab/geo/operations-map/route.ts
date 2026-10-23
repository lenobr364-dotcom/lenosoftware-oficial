import { NextRequest } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { getLiveOperationsMap } from "@/lib/services/operations-map.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const locale = request.nextUrl.searchParams.get("locale");

  try {
    const data = await getLiveOperationsMap(locale);
    return nexusLabJsonResponse({ ok: true, data }, { cache: "privateIntelligence" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "operations_map_failed";
    return nexusLabJsonResponse({ ok: false, error: message }, { status: 500, cache: "noStore" });
  }
}
