import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import type { AuditSeverity } from "@/lib/audit/types";
import type { LicenseEngineStatus } from "@/lib/licensing-engine/types";
import {
  approveEngineLicense,
  getLicensingEnginePage,
  issueEngineLicense,
  revokeEngineLicense,
} from "@/lib/services/licensing-engine.service";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint } from "@/lib/request-meta";

export const licensingDynamic = "force-dynamic";

const issueBodySchema = z.object({
  clientSubject: z.string().min(2).max(200),
  formulaCode: z.string().min(2).max(64),
  validFrom: z.string().min(8).max(64),
  validUntil: z.string().min(8).max(64),
});

const licenseIdBodySchema = z.object({
  licenseId: z.string().min(8).max(64),
});

const STATUSES = new Set<LicenseEngineStatus>(["PENDING", "ACTIVE", "REVOKED"]);

function json<T>(body: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, init);
}

function withApiHeaders(res: NextResponse): NextResponse {
  return applySecurityHeaders(res, "api");
}

function recordLicenseAudit(input: {
  category: "license_issue" | "license_approved" | "license_revoked";
  severity: AuditSeverity;
  licenseId: string;
  actorSubject: string;
  messageKey: string;
  messageParams: Record<string, string | number>;
  requestPath: string;
  ip: string | null;
}): void {
  recordAuditEvent({
    category: input.category,
    severity: input.severity,
    outcome: "success",
    actorSubject: input.actorSubject,
    resource: input.licenseId,
    messageKey: input.messageKey,
    messageParams: { licenseId: input.licenseId, ...input.messageParams },
    requestPath: input.requestPath,
    ip: input.ip,
  });
}

export async function handleLicensingLicensesGet(
  request: NextRequest,
): Promise<NextResponse> {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return withApiHeaders(guard);

  const sp = request.nextUrl.searchParams;
  const page = Number.parseInt(sp.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(sp.get("pageSize") ?? "20", 10);
  const rawStatus = sp.get("status") ?? "all";
  const status =
    rawStatus !== "all" && STATUSES.has(rawStatus as LicenseEngineStatus)
      ? (rawStatus as LicenseEngineStatus)
      : "all";

  try {
    const data = await getLicensingEnginePage({ page, pageSize, status });
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

export async function handleLicensingIssuePost(
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

  const parsed = issueBodySchema.safeParse(body);
  if (!parsed.success) {
    return withApiHeaders(json({ ok: false, error: "validation_error" }, { status: 400 }));
  }

  const result = await issueEngineLicense({
    clientSubject: parsed.data.clientSubject,
    formulaCode: parsed.data.formulaCode,
    validFrom: new Date(parsed.data.validFrom),
    validUntil: new Date(parsed.data.validUntil),
  });

  if (!result.ok) {
    const status = result.error === "unknown_formula_code" ? 404 : 400;
    return withApiHeaders(json({ ok: false, error: result.error }, { status }));
  }

  recordLicenseAudit({
    category: "license_issue",
    severity: "warning",
    licenseId: result.license.id,
    actorSubject: guard.actorSubject,
    messageKey: "eventLicenseIssue",
    messageParams: {
      formulaCode: parsed.data.formulaCode,
      client: parsed.data.clientSubject.slice(0, 48),
    },
    requestPath,
    ip: clientIpHint(request),
  });

  return withApiHeaders(json(result));
}

export async function handleLicensingApprove(
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

  const result = await approveEngineLicense(parsed.data.licenseId);
  if (!result.ok) {
    return withApiHeaders(json({ ok: false, error: result.error }, { status: 409 }));
  }

  recordLicenseAudit({
    category: "license_approved",
    severity: "info",
    licenseId: result.license.id,
    actorSubject: guard.actorSubject,
    messageKey: "eventLicenseApproved",
    messageParams: { formulaCode: result.license.formulaCode },
    requestPath,
    ip: clientIpHint(request),
  });

  return withApiHeaders(
    json({ ok: true, licenseId: result.license.id, status: "ACTIVE" as const }),
  );
}

export async function handleLicensingRevoke(
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

  const result = await revokeEngineLicense(parsed.data.licenseId);
  if (!result.ok) {
    return withApiHeaders(json({ ok: false, error: result.error }, { status: 409 }));
  }

  recordLicenseAudit({
    category: "license_revoked",
    severity: "critical",
    licenseId: result.license.id,
    actorSubject: guard.actorSubject,
    messageKey: "eventLicenseRevoked",
    messageParams: { formulaCode: result.license.formulaCode },
    requestPath,
    ip: clientIpHint(request),
  });

  return withApiHeaders(
    json({ ok: true, licenseId: result.license.id, status: "REVOKED" as const }),
  );
}
