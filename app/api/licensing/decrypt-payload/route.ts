import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { requestLicensedVaultDecrypt } from "@/lib/services/licensing-decrypt.service";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const PATH = "/api/licensing/decrypt-payload";

const bodySchema = z.object({
  licenseId: z.string().min(8).max(64),
  formulaId: z.string().min(2).max(64),
  locale: z.string().max(8).optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = NextResponse.json(
      { ok: false, authorized: false, error: "invalid_json" },
      { status: 400 },
    );
    return applySecurityHeaders(res, "api");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json(
      { ok: false, authorized: false, error: "validation_error" },
      { status: 400 },
    );
    return applySecurityHeaders(res, "api");
  }

  const result = await requestLicensedVaultDecrypt({
    licenseId: parsed.data.licenseId,
    formulaId: parsed.data.formulaId,
    locale: parsed.data.locale,
    actorSubject: guard.actorSubject,
    ip: clientIpHint(request),
    requestPath: PATH,
  });

  if (!result.ok) {
    const status =
      result.error === "license_not_found" || result.error === "formula_not_found" ? 404 : 403;
    const res = NextResponse.json(result, { status });
    return applySecurityHeaders(res, "api");
  }

  const res = NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
  return applySecurityHeaders(res, "api");
}
