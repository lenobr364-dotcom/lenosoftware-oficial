import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { verifyCeoLoginPassword } from "@/lib/executive-settings";
import { buildTotpEnrollPending, CEO_TOTP_ENROLL_COOKIE, generateTotpSecretBase32 } from "@/lib/mfa";
import { adminProfileTotpStartBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export async function POST(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = adminProfileTotpStartBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  if (!(await verifyCeoLoginPassword(parsed.data.currentPassword))) {
    return NextResponse.json({ ok: false, error: "invalid_current_password" }, { status: 401 });
  }

  const secret = generateTotpSecretBase32();
  const token = buildTotpEnrollPending(secret, 600);
  const account = encodeURIComponent("ChemVault CEO");
  const issuer = encodeURIComponent("ChemVault Global");
  const otpauthUrl = `otpauth://totp/${account}?secret=${encodeURIComponent(secret)}&issuer=${issuer}&digits=6&period=30`;

  const res = NextResponse.json({
    ok: true,
    otpauthUrl,
  });
  res.cookies.set(CEO_TOTP_ENROLL_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
