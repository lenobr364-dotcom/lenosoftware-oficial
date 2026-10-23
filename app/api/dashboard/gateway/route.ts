import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getGatewayDashboard } from "@/lib/services/api-gateway.service";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  try {
    const data = await getGatewayDashboard(guard.actorSubject);
    const res = NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "private, max-age=5, stale-while-revalidate=15" } },
    );
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "gateway_dashboard_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
