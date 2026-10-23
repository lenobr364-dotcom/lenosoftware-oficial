import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getChemicalVaultCatalog } from "@/lib/services/chemical-vault.service";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { inferRegionFromHeaders } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const regionCode = request.nextUrl.searchParams.get("region") ?? inferRegionFromHeaders(request);

  const coordinates =
    lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;

  try {
    const data = await getChemicalVaultCatalog(guard.actorSubject, {
      lat: coordinates?.lat,
      lng: coordinates?.lng,
      regionCode,
    });
    const res = NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "private, max-age=8, stale-while-revalidate=20" } },
    );
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "vault_catalog_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
