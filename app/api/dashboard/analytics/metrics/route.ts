import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getDashboardAnalyticsMetrics } from "@/lib/services/dashboard-analytics.service";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const locale = request.nextUrl.searchParams.get("locale");

  try {
    const data = await getDashboardAnalyticsMetrics(locale);
    const res = NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "private, max-age=12, stale-while-revalidate=30",
        },
      },
    );
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "analytics_metrics_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
