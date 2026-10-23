import { NextRequest } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { buildLabDashboardPayload } from "@/lib/services/lab-dashboard.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const locale = request.nextUrl.searchParams.get("locale");

  try {
    const { payload } = await buildLabDashboardPayload(locale);
    return nexusLabJsonResponse({ ok: true, data: payload, access: guard.mode }, { cache: "privateLab" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "lab_dashboard_failed";
    return nexusLabJsonResponse({ ok: false, error: message }, { status: 500, cache: "noStore" });
  }
}
