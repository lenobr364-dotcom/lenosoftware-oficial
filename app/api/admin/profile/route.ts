import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import {
  getExecutiveSettings,
  hasExecutivePasswordOverride,
  setExecutiveMfaOverride,
  setExecutivePassword,
  verifyCeoLoginPassword,
} from "@/lib/executive-settings";
import { assertMfaOverrideViable, normalizeAdminMfaOverrideInput } from "@/lib/mfa/override-normalize";
import { activeAdminMfaFactorAsync, resolvedTotpSecret } from "@/lib/mfa/resolver";
import { adminProfilePatchBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const row = await getExecutiveSettings();
  const [factor, totpConfigured, dbPw] = await Promise.all([
    activeAdminMfaFactorAsync(),
    resolvedTotpSecret().then((s) => Boolean(s?.length)),
    hasExecutivePasswordOverride(),
  ]);

  return NextResponse.json({
    ok: true,
    hasDatabasePassword: dbPw,
    adminMfaModeOverride: row?.adminMfaModeOverride ?? null,
    totpUsesDatabaseSecret: Boolean(row?.totpSecretBase32?.trim()?.length),
    activeMfaFactor: factor,
    totpSecretConfigured: totpConfigured,
  });
}

export async function PATCH(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = adminProfilePatchBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { currentPassword, newPassword, adminMfaModeOverride } = parsed.data;
  if (!(await verifyCeoLoginPassword(currentPassword))) {
    return NextResponse.json({ ok: false, error: "invalid_current_password" }, { status: 401 });
  }

  if (newPassword) {
    await setExecutivePassword(newPassword);
  }

  if (adminMfaModeOverride !== undefined) {
    let normalized: string | null;
    try {
      normalized = normalizeAdminMfaOverrideInput(adminMfaModeOverride);
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_mfa_tokens" }, { status: 400 });
    }
    if (normalized !== null) {
      try {
        await assertMfaOverrideViable(normalized);
      } catch {
        return NextResponse.json({ ok: false, error: "invalid_mfa_configuration" }, { status: 400 });
      }
    }
    await setExecutiveMfaOverride({ mode: normalized });
  }

  return NextResponse.json({ ok: true });
}
