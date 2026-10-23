import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";
import { hqLabMeta, mintAndApplyHqLabCookie } from "@/lib/lab/hq-access";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { cacheControlHeader } from "@/lib/http/cache-policy";

export const dynamic = "force-dynamic";

/**
 * POST — emite cookie de atestação do QG (Barra do Garças) após sessão CEO + licença core.
 */
export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const ceoToken = request.cookies.get(CEO_SESSION_COOKIE)?.value;
  if (!(await verifyCeoSessionToken(ceoToken))) {
    const res = NextResponse.json({ error: "ceo_session_required" }, { status: 401 });
    return applySecurityHeaders(res, "api");
  }

  const parts = ceoToken!.split(".");
  const exp = Number.parseInt(parts[0] ?? "", 10);
  if (!Number.isFinite(exp)) {
    const res = NextResponse.json({ error: "invalid_ceo_session" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const res = NextResponse.json({
    ok: true,
    hq: hqLabMeta(),
    actor: guard.actorSubject,
  });
  res.headers.set("Cache-Control", cacheControlHeader("noStore"));
  await mintAndApplyHqLabCookie(res, exp);
  return applySecurityHeaders(res, "api");
}
