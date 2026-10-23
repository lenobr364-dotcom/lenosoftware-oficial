import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CEO_SESSION_COOKIE, CEO_SESSION_MAX_AGE, signCeoSessionToken } from "@/lib/ceo-session";
import { applyCoreLicenseCookie, mintCoreLicenseSession } from "@/lib/core-license-session";
import { mintAndApplyHqLabCookie } from "@/lib/lab/hq-access";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";
import { recordLicenseActivity } from "@/lib/telemetry-db";
import { dispatchLicenseActivatedWebhook } from "@/lib/webhook-dispatch";

export async function finalizeCeoLoginSession(request: NextRequest, emailNorm: string): Promise<NextResponse> {
  const exp = Math.floor(Date.now() / 1000) + CEO_SESSION_MAX_AGE;
  const token = await signCeoSessionToken(emailNorm, exp);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CEO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CEO_SESSION_MAX_AGE,
  });

  const core = await mintCoreLicenseSession(`ceo:${emailNorm}`, CEO_SESSION_MAX_AGE);
  applyCoreLicenseCookie(res, core);
  await mintAndApplyHqLabCookie(res, exp);

  /**
   * Gate simples para /laboratorio: middleware checa `role=ceo` + `license=core`.
   * Não-httpOnly de propósito (legíveis pelo client) — não substituem HMAC; só
   * destravam a entrada na bancada após login real e validado pelo servidor.
   */
  const labGateCookie = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CEO_SESSION_MAX_AGE,
  };
  res.cookies.set("role", "CEO", labGateCookie);
  res.cookies.set("license", "core", labGateCookie);

  const region = inferRegionFromHeaders(request);
  const ip = clientIpHint(request);
  void recordLicenseActivity({
    subject: `ceo:${emailNorm}`,
    channel: "ceo",
    region,
    ip,
  });

  dispatchLicenseActivatedWebhook({
    source: "ceo",
    subject: `ceo:${emailNorm}`,
    region,
    ip,
    channel: "ceo",
  });

  return res;
}
