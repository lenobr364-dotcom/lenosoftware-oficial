import type {
  DecryptPayloadBody,
  DecryptPayloadResponse,
  LicensingActionResponse,
  LicensingIssueBody,
  LicensingIssueResponse,
  LicensingLicensesResponse,
  LicensingLicenseIdBody,
} from "@/lib/licensing/api-types";
import type { LicenseEngineStatus, LicensingEngineQuery } from "@/lib/licensing-engine/types";

const BASE = "/api/licensing";

async function requestJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function fetchLicenses(query: LicensingEngineQuery): Promise<LicensingLicensesResponse> {
  const qs = new URLSearchParams({
    page: String(query.page ?? 1),
    pageSize: String(query.pageSize ?? 20),
    status: query.status ?? "all",
  });
  const res = await fetch(`${BASE}/licenses?${qs}`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const json = await requestJson<LicensingLicensesResponse>(res);
  if (!res.ok && json.ok === false) return json;
  if (!res.ok) return { ok: false, error: "licenses_failed" };
  return json;
}

export async function issueLicense(body: LicensingIssueBody): Promise<LicensingIssueResponse> {
  const res = await fetch(`${BASE}/issue`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<LicensingIssueResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, error: "validation_error" };
  return json;
}

export async function approveLicense(body: LicensingLicenseIdBody): Promise<LicensingActionResponse> {
  const res = await fetch(`${BASE}/approve`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<LicensingActionResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, error: "license_not_pending" };
  return json;
}

export async function revokeLicense(body: LicensingLicenseIdBody): Promise<LicensingActionResponse> {
  const res = await fetch(`${BASE}/revoke`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<LicensingActionResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, error: "license_not_revokable" };
  return json;
}

export async function decryptVaultPayload(body: DecryptPayloadBody): Promise<DecryptPayloadResponse> {
  const res = await fetch("/api/licensing/decrypt-payload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await requestJson<DecryptPayloadResponse>(res);
  if (!res.ok && !json.ok) return json;
  if (!res.ok) return { ok: false, authorized: false, error: "license_not_valid" };
  return json;
}

export type { LicenseEngineStatus };
