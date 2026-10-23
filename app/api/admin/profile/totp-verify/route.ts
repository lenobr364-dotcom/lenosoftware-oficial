import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { setExecutiveTotpSecretOnly } from "@/lib/executive-settings";
import { CEO_TOTP_ENROLL_COOKIE, verifyTotp, verifyTotpEnrollToken } from "@/lib/mfa";
import { adminProfileTotpVerifyBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

const clearCookie = (res: NextResponse) => {
  res.cookies.set(CEO_TOTP_ENROLL_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

export async function POST(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const pendingRaw = request.cookies.get(CEO_TOTP_ENROLL_COOKIE)?.value;
  const pending = verifyTotpEnrollToken(pendingRaw);
  if (!pending) {
    return NextResponse.json({ ok: false, error: "totp_enroll_session_invalid" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = adminProfileTotpVerifyBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const code = parsed.data.code.replace(/\s/g, "");
  if (!verifyTotp(pending.secretBase32, code)) {
    return NextResponse.json({ ok: false, error: "invalid_totp" }, { status: 401 });
  }

  await setExecutiveTotpSecretOnly(pending.secretBase32);
  const res = NextResponse.json({ ok: true });
  clearCookie(res);
  return res;
}
