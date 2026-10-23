import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { SecuritySeverity } from "@prisma/client";
import { finalizeCeoLoginSession } from "@/lib/ceo-login-finalize";
import { normalizeAdminEmail } from "@/lib/ceo-session";
import { hasExecutivePasswordOverride, verifyCeoLoginPassword } from "@/lib/executive-settings";
import {
  activeAdminMfaFactorAsync,
  buildEmailOtpPending,
  buildTotpPending,
  CEO_MFA_PENDING_COOKIE,
} from "@/lib/mfa";
import { sendAdminMfaOtpEmail } from "@/lib/mfa/send-email-otp";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";
import { recordSecurityEvent } from "@/lib/telemetry-db";
import { ceoAuthBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";
function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const envPassword = process.env.ADMIN_PASSWORD ?? "";
  const dbPw = await hasExecutivePasswordOverride();
  if (!adminEmail || (!dbPw && envPassword.length === 0)) {
    return NextResponse.json({ ok: false, error: "CEO credentials are not configured." }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ceoAuthBodySchema.safeParse(raw);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const email = parsed.data.email.trim();
  const password = parsed.data.password;

  const emailOk = safeEqualString(normalizeAdminEmail(email), normalizeAdminEmail(adminEmail));
  const passwordOk = await verifyCeoLoginPassword(password);

  if (!emailOk || !passwordOk) {
    void recordSecurityEvent({
      type: "ceo_login_failure",
      severity: SecuritySeverity.WARNING,
      title: "Executive dashboard login failed",
      detail: "Invalid email or password attempt.",
      requestPath: "/api/auth/ceo",
      requestId: null,
      ip: clientIpHint(request),
      userAgent: request.headers.get("user-agent"),
      region: inferRegionFromHeaders(request),
    });
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const emailNorm = normalizeAdminEmail(adminEmail);
  const factor = await activeAdminMfaFactorAsync();

  if (factor === "totp") {
    const { token } = buildTotpPending(emailNorm, 300);
    const res = NextResponse.json({ ok: true, mfaRequired: true, factor: "totp" as const });
    res.cookies.set(CEO_MFA_PENDING_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 300,
    });
    return res;
  }

  if (factor === "email") {
    const { token, code } = buildEmailOtpPending(emailNorm, 600);
    const sent = await sendAdminMfaOtpEmail(adminEmail, code);
    if (!sent) {
      return NextResponse.json({ ok: false, error: "mfa_email_send_failed" }, { status: 503 });
    }
    const res = NextResponse.json({ ok: true, mfaRequired: true, factor: "email" as const });
    res.cookies.set(CEO_MFA_PENDING_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
    return res;
  }

  return finalizeCeoLoginSession(request, emailNorm);
}
