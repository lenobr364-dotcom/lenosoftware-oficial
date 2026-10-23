import { recordAuditEvent } from "@/lib/audit/record-audit-event";

export function recordComplianceCertificateAudit(input: {
  documentId: string;
  licenseId: string;
  actorSubject: string;
  requestPath: string;
  ip: string | null;
}): void {
  recordAuditEvent({
    category: "compliance_certificate",
    severity: "info",
    outcome: "success",
    actorSubject: input.actorSubject,
    resource: input.documentId,
    messageKey: "eventComplianceCertificate",
    messageParams: {
      documentId: input.documentId,
      licenseId: input.licenseId,
    },
    requestPath: input.requestPath,
    ip: input.ip,
  });
}

export function recordComplianceAuditExport(input: {
  documentId: string;
  format: string;
  rowCount: number;
  actorSubject: string;
  requestPath: string;
  ip: string | null;
}): void {
  recordAuditEvent({
    category: "compliance_audit_export",
    severity: "info",
    outcome: "success",
    actorSubject: input.actorSubject,
    resource: input.documentId,
    messageKey: "eventComplianceAuditExport",
    messageParams: {
      documentId: input.documentId,
      format: input.format,
      rowCount: input.rowCount,
    },
    requestPath: input.requestPath,
    ip: input.ip,
  });
}
