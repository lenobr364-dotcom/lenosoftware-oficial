import type {
  ComplianceCertificateResponse,
  ComplianceExportBody,
  ComplianceExportResponse,
  ComplianceLicenseIdBody,
  ComplianceLicensesResponse,
} from "@/lib/compliance/api-types";
import type { LicensingEngineQuery } from "@/lib/licensing-engine/types";

const BASE = "/api/compliance";

async function requestJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function fetchComplianceLicenses(
  query: LicensingEngineQuery,
): Promise<ComplianceLicensesResponse> {
  const qs = new URLSearchParams({
    page: String(query.page ?? 1),
    pageSize: String(query.pageSize ?? 20),
  });
  const res = await fetch(`${BASE}/licenses?${qs}`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const json = await requestJson<ComplianceLicensesResponse>(res);
  if (!res.ok && json.ok === false) return json;
  if (!res.ok) return { ok: false, error: "licenses_failed" };
  return json;
}

export async function generateComplianceCertificate(
  body: ComplianceLicenseIdBody,
): Promise<ComplianceCertificateResponse> {
  const res = await fetch(`${BASE}/generate-certificate`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<ComplianceCertificateResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, error: "license_not_found" };
  return json;
}

export async function exportComplianceAuditReport(
  body: ComplianceExportBody = {},
): Promise<ComplianceExportResponse> {
  const res = await fetch(`${BASE}/export-audit-report`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<ComplianceExportResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, error: "export_failed" };
  return json;
}

export function downloadComplianceExport(
  payload: Extract<ComplianceExportResponse, { ok: true }>["export"],
): void {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = payload.filename;
  a.click();
  URL.revokeObjectURL(url);
}
