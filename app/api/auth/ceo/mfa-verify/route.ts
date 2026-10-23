import { NextRequest, NextResponse } from "next/server";

import { finalizeCeoLoginSession } from "@/lib/ceo-login-finalize";
import { normalizeAdminEmail } from "@/lib/ceo-session";
import {
  CEO_MFA_PENDING_COOKIE,
  verifyEmailOtpCode,
  verifyMfaPendingToken,
} from "@/lib/mfa";
import { resolvedTotpSecret } from "@/lib/mfa/resolver";
import { verifyTotp } from "@/lib/mfa/totp";
import { ceoMfaVerifyBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

const clearMfaCookie = (res: NextResponse) => {
  res.cookies.set(CEO_MFA_PENDING_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export async function POST(request: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  const adminNorm = normalizeAdminEmail(adminEmail);

  const pendingRaw = request.cookies.get(CEO_MFA_PENDING_COOKIE)?.value;
  const pending = verifyMfaPendingToken(pendingRaw);
  if (!pending || pending.emailNorm !== adminNorm) {
    return NextResponse.json({ ok: false, error: "mfa_session_invalid" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = ceoMfaVerifyBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  if (pending.kind === "totp") {
    const secret = await resolvedTotpSecret();
    if (!secret) {
      return NextResponse.json({ ok: false, error: "totp_not_configured" }, { status: 503 });
    }
    const code = parsed.data.totp?.replace(/\s/g, "") ?? "";
    if (!code || !verifyTotp(secret, code)) {
      return NextResponse.json({ ok: false, error: "invalid_totp" }, { status: 401 });
    }
  } else if (pending.kind === "email") {
    const code = parsed.data.emailCode?.trim() ?? "";
    if (!code || !verifyEmailOtpCode(pending, code)) {
      return NextResponse.json({ ok: false, error: "invalid_email_code" }, { status: 401 });
    }
  } else {
    return NextResponse.json({ ok: false, error: "unsupported_mfa" }, { status: 400 });
  }

  const res = await finalizeCeoLoginSession(request, adminNorm);
  clearMfaCookie(res);
  return res;
}
