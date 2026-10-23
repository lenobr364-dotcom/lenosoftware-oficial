export type AuditSeverity = "info" | "warning" | "critical";

export type AuditOutcome = "success" | "failure" | "blocked";

export type AuditCategory =
  | "vault_download"
  | "vault_download_blocked"
  | "api_key_minted"
  | "api_key_revoked"
  | "api_key_gateway"
  | "simulator_run"
  | "simulator_compliance_fail"
  | "license_issue"
  | "license_approved"
  | "license_revoked"
  | "vault_decrypt"
  | "compliance_certificate"
  | "compliance_audit_export"
  | "security_event";

export type AuditLedgerEntry = {
  id: string;
  at: string;
  category: AuditCategory;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  actorHint: string;
  resource: string;
  region: string | null;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  requestPath: string | null;
};

export type AuditTrailPage = {
  items: AuditLedgerEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AuditTrailQuery = {
  page?: number;
  pageSize?: number;
  category?: AuditCategory | "all";
  severity?: AuditSeverity | "all";
};
