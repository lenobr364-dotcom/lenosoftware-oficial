import { timingSafeEqual } from "node:crypto";

import { SecuritySeverity } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { applyCoreLicenseCookie, mintCoreLicenseSession } from "@/lib/core-license-session";
import { getVaultAccessKey } from "@/lib/vault-master-key-server";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";
import { recordLicenseActivity, recordSecurityEvent } from "@/lib/telemetry-db";
import { vaultUnlockBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";
import { dispatchLicenseActivatedWebhook } from "@/lib/webhook-dispatch";
import { signVaultGateToken, VAULT_GATE_COOKIE } from "@/lib/vault-session";

export const dynamic = "force-dynamic";

function secureCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = vaultUnlockBodySchema.safeParse(raw);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }
  const key = parsed.data.accessKey.trim();
  const expected = getVaultAccessKey();

  if (!secureCompare(key, expected)) {
    void recordSecurityEvent({
      type: "vault_unlock_denied",
      severity: SecuritySeverity.WARNING,
      title: "Landing vault unlock denied",
      detail: "Invalid landing vault access key.",
      requestPath: "/api/vault/unlock",
      requestId: null,
      ip: clientIpHint(request),
      userAgent: request.headers.get("user-agent"),
      region: inferRegionFromHeaders(request),
    });
    return NextResponse.json({ ok: false, error: "denied" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const token = signVaultGateToken();
  const secure = process.env.NODE_ENV === "production";
  const vaultMaxAge = 2 * 60 * 60;
  res.cookies.set(VAULT_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: vaultMaxAge,
  });
  const core = await mintCoreLicenseSession("vault:formula-landing", vaultMaxAge);
  applyCoreLicenseCookie(res, core);

  const region = inferRegionFromHeaders(request);
  const ip = clientIpHint(request);
  void recordLicenseActivity({
    subject: "vault:formula-landing",
    channel: "vault_unlock",
    region,
    ip,
  });

  dispatchLicenseActivatedWebhook({
    source: "vault_unlock",
    subject: "vault:formula-landing",
    region,
    ip,
    channel: "vault_unlock",
  });

  return res;
}
