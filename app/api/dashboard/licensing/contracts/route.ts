import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getLicensingContracts } from "@/lib/services/licensing-contracts.service";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const locale = request.nextUrl.searchParams.get("locale");

  try {
    const data = await getLicensingContracts(locale);
    const res = NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=25" } },
    );
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "contracts_list_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
