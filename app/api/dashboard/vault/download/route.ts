import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { requestVaultDownload } from "@/lib/services/chemical-vault.service";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  formulaId: z.string().min(1).max(64),
  locale: z.string().max(8).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
  regionCode: z.string().max(16).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const headerRegion = inferRegionFromHeaders(request);
  const regionCode = parsed.data.regionCode ?? headerRegion;
  const ip = clientIpHint(request);
  const result = await requestVaultDownload(
    guard.actorSubject,
    parsed.data.formulaId,
    {
      lat: parsed.data.coordinates?.lat,
      lng: parsed.data.coordinates?.lng,
      regionCode,
    },
    parsed.data.locale ?? "en",
  );

  if (!result.ok) {
    recordAuditEvent({
      category: "vault_download_blocked",
      severity: "warning",
      outcome: "blocked",
      actorSubject: guard.actorSubject,
      resource: parsed.data.formulaId,
      region: regionCode,
      messageKey: "eventVaultDownloadBlocked",
      messageParams: { formulaId: parsed.data.formulaId, reason: result.reason },
      requestPath: "/api/dashboard/vault/download",
      ip,
    });
    const res = NextResponse.json(
      { ok: false, blocked: true, reason: result.reason },
      { status: 403 },
    );
    return applySecurityHeaders(res, "api");
  }

  recordAuditEvent({
    category: "vault_download",
    severity: "info",
    outcome: "success",
    actorSubject: guard.actorSubject,
    resource: parsed.data.formulaId,
    region: regionCode,
    messageKey: "eventVaultDownloadSuccess",
    messageParams: { formulaId: parsed.data.formulaId, filename: result.filename },
    requestPath: "/api/dashboard/vault/download",
    ip,
  });

  const res = new NextResponse(result.body, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
      "X-ChemVault-Encryption": "AES-256-GCM",
    },
  });
  return applySecurityHeaders(res, "api");
}
