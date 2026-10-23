import type { ComplianceAuditExportPayload, ComplianceCertificatePayload } from "@/lib/compliance/types";
import type { LicensingEnginePage } from "@/lib/licensing-engine/types";

export type ComplianceApiErrorCode =
  | "invalid_json"
  | "validation_error"
  | "license_not_found"
  | "license_not_certifiable"
  | "licenses_failed"
  | "export_failed";

export type ComplianceLicenseIdBody = {
  licenseId: string;
};

export type ComplianceExportBody = {
  format?: "csv" | "json";
};

export type ComplianceLicensesResponse =
  | { ok: true; data: LicensingEnginePage }
  | { ok: false; error: ComplianceApiErrorCode | string };

export type ComplianceCertificateResponse =
  | { ok: true; certificate: ComplianceCertificatePayload }
  | { ok: false; error: ComplianceApiErrorCode | string };

export type ComplianceExportResponse =
  | { ok: true; export: ComplianceAuditExportPayload }
  | { ok: false; error: ComplianceApiErrorCode | string };
