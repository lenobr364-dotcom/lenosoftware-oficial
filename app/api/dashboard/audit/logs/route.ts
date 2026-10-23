import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getAuditTrailPage } from "@/lib/services/audit-trail.service";
import type { AuditCategory, AuditSeverity } from "@/lib/audit/types";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

const CATEGORIES = new Set<AuditCategory>([
  "vault_download",
  "vault_download_blocked",
  "api_key_minted",
  "api_key_revoked",
  "api_key_gateway",
  "simulator_run",
  "simulator_compliance_fail",
  "license_issue",
  "license_approved",
  "license_revoked",
  "vault_decrypt",
  "security_event",
]);

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const sp = request.nextUrl.searchParams;
  const page = Number.parseInt(sp.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(sp.get("pageSize") ?? "25", 10);
  const rawCategory = sp.get("category") ?? "all";
  const rawSeverity = sp.get("severity") ?? "all";

  const category =
    rawCategory !== "all" && CATEGORIES.has(rawCategory as AuditCategory)
      ? (rawCategory as AuditCategory)
      : "all";
  const severity =
    rawSeverity === "info" || rawSeverity === "warning" || rawSeverity === "critical"
      ? (rawSeverity as AuditSeverity)
      : "all";

  try {
    const data = await getAuditTrailPage({ page, pageSize, category, severity });
    const res = NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "private, max-age=3, stale-while-revalidate=8" } },
    );
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "audit_logs_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
