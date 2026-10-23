import { listAuditLedgerEntries } from "@/lib/audit/audit-ledger-store";
import type { AuditCategory, AuditLedgerEntry, AuditSeverity, AuditTrailPage, AuditTrailQuery } from "@/lib/audit/types";
import { prisma } from "@/lib/prisma";

const CATEGORY_MAP: Record<string, AuditCategory> = {
  vault_download: "vault_download",
  vault_download_blocked: "vault_download_blocked",
  api_key_minted: "api_key_minted",
  api_key_revoked: "api_key_revoked",
  simulator_compliance_fail: "simulator_compliance_fail",
  simulator_run: "simulator_run",
};

function mapPrismaSeverity(s: string): AuditSeverity {
  if (s === "CRITICAL") return "critical";
  if (s === "WARNING") return "warning";
  return "info";
}

async function hydrateFromPrismaIfSparse(fileEvents: AuditLedgerEntry[]): Promise<AuditLedgerEntry[]> {
  if (fileEvents.length >= 40) return fileEvents;

  const rows = await prisma.securityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    select: {
      id: true,
      type: true,
      severity: true,
      title: true,
      detail: true,
      requestPath: true,
      region: true,
      createdAt: true,
    },
  });

  const fromDb: AuditLedgerEntry[] = rows.map((r) => ({
    id: `db_${r.id}`,
    at: r.createdAt.toISOString(),
    category: CATEGORY_MAP[r.type] ?? "security_event",
    severity: mapPrismaSeverity(r.severity),
    outcome: r.severity === "CRITICAL" ? "failure" : "success",
    actorHint: "system",
    resource: r.title.slice(0, 128),
    region: r.region,
    messageKey: "eventSecurityDb",
    messageParams: { title: r.title },
    requestPath: r.requestPath,
  }));

  const seen = new Set(fileEvents.map((e) => e.id));
  const merged = [...fileEvents];
  for (const row of fromDb) {
    if (!seen.has(row.id)) merged.push(row);
  }
  return merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export async function buildAuditTrailPage(query: AuditTrailQuery): Promise<AuditTrailPage> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, query.pageSize ?? 25));

  let all = await listAuditLedgerEntries();
  all = await hydrateFromPrismaIfSparse(all);

  if (query.category && query.category !== "all") {
    all = all.filter((e) => e.category === query.category);
  }
  if (query.severity && query.severity !== "all") {
    all = all.filter((e) => e.severity === query.severity);
  }

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  return {
    items,
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
