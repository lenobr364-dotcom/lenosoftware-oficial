import { createHash, randomBytes } from "crypto";

import { listAuditLedgerEntries } from "@/lib/audit/audit-ledger-store";
import type { AuditLedgerEntry } from "@/lib/audit/types";
import type { ComplianceAuditExportFormat, ComplianceAuditExportPayload } from "@/lib/compliance/types";

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function newDocumentId(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = randomBytes(4).toString("hex");
  return `${prefix}_${stamp}_${rand}`;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function rowToCsvLine(row: AuditLedgerEntry): string {
  const cells = [
    row.id,
    row.at,
    row.category,
    row.severity,
    row.outcome,
    row.actorHint,
    row.resource,
    row.region ?? "",
    row.messageKey,
    JSON.stringify(row.messageParams ?? {}),
    row.requestPath ?? "",
  ];
  return cells.map((c) => escapeCsvCell(String(c))).join(",");
}

function buildCsv(events: AuditLedgerEntry[]): string {
  const header = [
    "id",
    "at",
    "category",
    "severity",
    "outcome",
    "actorHint",
    "resource",
    "region",
    "messageKey",
    "messageParams",
    "requestPath",
  ].join(",");
  return [header, ...events.map(rowToCsvLine)].join("\n");
}

export async function buildComplianceAuditExport(input: {
  format: ComplianceAuditExportFormat;
  actorSubject: string;
}): Promise<ComplianceAuditExportPayload> {
  const events = await listAuditLedgerEntries();
  const documentId = newDocumentId("CAR");
  const exportedAt = new Date().toISOString();

  const content =
    input.format === "csv"
      ? buildCsv(events)
      : JSON.stringify({ exportedAt, events }, null, 2);

  const bodyForDigest = {
    documentId,
    type: "AUDIT_REPORT_EXPORT_V1" as const,
    exportedAt,
    format: input.format,
    rowCount: events.length,
    issuer: { platform: "ChemVault Global" as const, actorSubject: input.actorSubject },
  };

  const documentDigest = sha256Hex(JSON.stringify(bodyForDigest));
  const verificationKey = sha256Hex(`${documentId}|${documentDigest}|${input.actorSubject}`);

  const ext = input.format === "csv" ? "csv" : "json";
  const mimeType = input.format === "csv" ? "text/csv;charset=utf-8" : "application/json";

  return {
    ...bodyForDigest,
    regulatory: {
      signatureAlgorithm: "SHA-256",
      documentDigest,
      verificationKey,
    },
    content,
    filename: `ChemVault-Audit-Report-${documentId}.${ext}`,
    mimeType,
  };
}
