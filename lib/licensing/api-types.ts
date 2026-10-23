import type { LicensingEnginePage } from "@/lib/licensing-engine/types";

export type LicensingApiErrorCode =
  | "invalid_json"
  | "validation_error"
  | "unknown_formula_code"
  | "invalid_date_range"
  | "license_not_pending"
  | "license_not_revokable"
  | "licenses_failed";

export type LicensingIssueBody = {
  clientSubject: string;
  formulaCode: string;
  validFrom: string;
  validUntil: string;
};

export type LicensingLicenseIdBody = {
  licenseId: string;
};

export type LicensingIssueSuccess = {
  ok: true;
  license: { id: string; grantHash: string; chainAnchor: string };
  formulaId: string;
  formulaName: string;
};

export type LicensingActionSuccess = {
  ok: true;
  licenseId: string;
  status: "ACTIVE" | "REVOKED";
};

export type LicensingApiFailure = {
  ok: false;
  error: LicensingApiErrorCode | string;
};

export type LicensingLicensesSuccess = {
  ok: true;
  data: LicensingEnginePage;
};

export type LicensingIssueResponse = LicensingIssueSuccess | LicensingApiFailure;
export type LicensingActionResponse = LicensingActionSuccess | LicensingApiFailure;
export type LicensingLicensesResponse = LicensingLicensesSuccess | LicensingApiFailure;

export type DecryptPayloadBody = {
  licenseId: string;
  formulaId: string;
  locale?: string;
};

export type DecryptPayloadSuccess = {
  ok: true;
  authorized: true;
  accessToken: string;
  expiresAt: string;
  expiresInSeconds: number;
  encryptedPayload: {
    schema: string;
    formulaId: string;
    formulaCode: string;
    licenseId: string;
    algorithm: string;
    iv: string;
    authTag: string;
    ciphertext: string;
    keyHint: string;
    sealedAt: string;
  };
  vaultDownloadHint: string;
};

export type DecryptPayloadFailure = {
  ok: false;
  authorized: false;
  error: string;
};

export type DecryptPayloadResponse = DecryptPayloadSuccess | DecryptPayloadFailure;
