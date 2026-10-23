import { appendAuditLedgerEntry, invalidateAuditCache } from "@/lib/audit/audit-ledger-store";
import type { AuditCategory, AuditOutcome, AuditSeverity } from "@/lib/audit/types";
import { recordSecurityEvent } from "@/lib/telemetry-db";
import type { SecuritySeverity } from "@prisma/client";

export function maskActorHint(subject: string): string {
  const s = subject.trim();
  if (!s) return "actor:unknown";
  if (s.length <= 12) return `actor:${s}`;
  return `actor:${s.slice(0, 6)}…${s.slice(-4)}`;
}

function toPrismaSeverity(severity: AuditSeverity): SecuritySeverity {
  if (severity === "critical") return "CRITICAL";
  if (severity === "warning") return "WARNING";
  return "INFO";
}

export type RecordAuditInput = {
  category: AuditCategory;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  actorSubject: string;
  resource: string;
  region?: string | null;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  requestPath?: string | null;
  ip?: string | null;
};

/** Append to high-performance ledger; mirror critical/warning to Prisma (best-effort). */
export function recordAuditEvent(input: RecordAuditInput): void {
  void (async () => {
    await appendAuditLedgerEntry({
      category: input.category,
      severity: input.severity,
      outcome: input.outcome,
      actorHint: maskActorHint(input.actorSubject),
      resource: input.resource.slice(0, 256),
      region: input.region?.slice(0, 32) ?? null,
      messageKey: input.messageKey,
      messageParams: input.messageParams,
      requestPath: input.requestPath ?? null,
    });
    invalidateAuditCache();

    if (input.severity === "info" && input.outcome === "success") return;

    const title = `${input.category}:${input.resource}`.slice(0, 256);
    await recordSecurityEvent({
      type: input.category.slice(0, 96),
      severity: toPrismaSeverity(input.severity),
      title,
      detail: JSON.stringify({
        outcome: input.outcome,
        messageKey: input.messageKey,
        messageParams: input.messageParams,
      }).slice(0, 2000),
      requestPath: input.requestPath ?? null,
      ip: input.ip ?? null,
      region: input.region ?? null,
    });
  })();
}
