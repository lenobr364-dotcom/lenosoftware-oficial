import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { buildComplianceAuditExport } from "@/lib/compliance/compliance-audit-export";
import { buildComplianceCertificate } from "@/lib/compliance/compliance-certificate";
import {
  recordComplianceAuditExport,
  recordComplianceCertificateAudit,
} from "@/lib/compliance/record-compliance-audit";
import { getFormulaIndustrialLicenseById } from "@/lib/formula-license-smart-contract";
import { buildComplianceLicensePage } from "@/lib/licensing-engine/license-registry.builder";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint } from "@/lib/request-meta";

export const complianceDynamic = "force-dynamic";

const licenseIdBodySchema = z.object({
  licenseId: z.string().min(8).max(64),
});

const exportBodySchema = z.object({
  format: z.enum(["csv", "json"]).optional(),
});

function json<T>(body: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, init);
}

function withApiHeaders(res: NextResponse): NextResponse {
  return applySecurityHeaders(res, "api");
}

export async function handleComplianceLicensesGet(request: NextRequest): Promise<NextResponse> {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return withApiHeaders(guard);

  const sp = request.nextUrl.searchParams;
  const page = Number.parseInt(sp.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(sp.get("pageSize") ?? "20", 10);

  try {
    const data = await buildComplianceLicensePage({ page, pageSize, status: "all" });
    return withApiHeaders(
      json(
        { ok: true, data },
        { headers: { "Cache-Control": "private, max-age=2, stale-while-revalidate=6" } },
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "licenses_failed";
    return withApiHeaders(json({ ok: false, error: message }, { status: 500 }));
  }
}

export async function handleComplianceGenerateCertificatePost(
  request: NextRequest,
  requestPath: string,
): Promise<NextResponse> {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return withApiHeaders(guard);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withApiHeaders(json({ ok: false, error: "invalid_json" }, { status: 400 }));
  }

  const parsed = licenseIdBodySchema.safeParse(body);
  if (!parsed.success) {
    return withApiHeaders(json({ ok: false, error: "validation_error" }, { status: 400 }));
  }

  const row = await getFormulaIndustrialLicenseById(parsed.data.licenseId);
  if (!row) {
    return withApiHeaders(json({ ok: false, error: "license_not_found" }, { status: 404 }));
  }
  if (row.status === "PENDING") {
    return withApiHeaders(json({ ok: false, error: "license_not_certifiable" }, { status: 400 }));
  }

  const certificate = buildComplianceCertificate({
    license: row,
    actorSubject: guard.actorSubject,
  });

  recordComplianceCertificateAudit({
    documentId: certificate.documentId,
    licenseId: row.id,
    actorSubject: guard.actorSubject,
    requestPath,
    ip: clientIpHint(request),
  });

  return withApiHeaders(json({ ok: true, certificate }));
}

export async function handleComplianceExportAuditReportPost(
  request: NextRequest,
  requestPath: string,
): Promise<NextResponse> {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return withApiHeaders(guard);

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text);
  } catch {
    return withApiHeaders(json({ ok: false, error: "invalid_json" }, { status: 400 }));
  }

  const parsed = exportBodySchema.safeParse(body);
  if (!parsed.success) {
    return withApiHeaders(json({ ok: false, error: "validation_error" }, { status: 400 }));
  }

  const format = parsed.data.format ?? "csv";

  try {
    const exportDoc = await buildComplianceAuditExport({
      format,
      actorSubject: guard.actorSubject,
    });

    recordComplianceAuditExport({
      documentId: exportDoc.documentId,
      format: exportDoc.format,
      rowCount: exportDoc.rowCount,
      actorSubject: guard.actorSubject,
      requestPath,
      ip: clientIpHint(request),
    });

    return withApiHeaders(json({ ok: true, export: exportDoc }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "export_failed";
    return withApiHeaders(json({ ok: false, error: message }, { status: 500 }));
  }
}
