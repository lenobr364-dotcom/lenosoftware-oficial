import { recordAuditEvent } from "@/lib/audit/record-audit-event";

export function recordVaultDecryptAudit(input: {
  authorized: boolean;
  licenseId: string;
  formulaId: string;
  actorSubject: string;
  ip: string | null;
  requestPath: string;
  reason?: string;
}): void {
  recordAuditEvent({
    category: "vault_decrypt",
    severity: "critical",
    outcome: input.authorized ? "success" : "blocked",
    actorSubject: input.actorSubject,
    resource: input.licenseId,
    messageKey: input.authorized ? "eventVaultDecryptAuthorized" : "eventVaultDecryptDenied",
    messageParams: {
      licenseId: input.licenseId,
      formulaId: input.formulaId,
      reason: input.reason ?? (input.authorized ? "granted" : "denied"),
    },
    requestPath: input.requestPath,
    ip: input.ip,
  });
}
