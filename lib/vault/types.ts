import type { LicenseStatus } from "@/lib/formulas";

export type EncryptionStatus = "aes256_active" | "aes256_rotating";

export type VaultDownloadBlockReason =
  | "none"
  | "license_pending"
  | "license_unknown"
  | "regional_blocked"
  | "regional_conditional"
  | "geo_denied"
  | "compliance";

export type VaultFormulaItem = {
  id: string;
  name: string;
  code: string;
  license: LicenseStatus;
  lastUpdated: string;
  encryption: {
    algorithm: "AES-256-GCM";
    status: EncryptionStatus;
    keyId: string;
    atRest: boolean;
  };
  downloadReady: boolean;
  blockReason: VaultDownloadBlockReason;
  regionalVerdict: "approved" | "conditional" | "blocked" | "unknown";
  fileLabel: string;
  sizeHint: string;
};

export type VaultCatalogPayload = {
  items: VaultFormulaItem[];
  regionCode: string;
  regionLabelKey: string;
  stats: {
    total: number;
    encrypted: number;
    downloadReady: number;
  };
};

export type VaultDownloadResult =
  | { ok: true; filename: string; contentType: string; body: string }
  | { ok: false; reason: VaultDownloadBlockReason };
