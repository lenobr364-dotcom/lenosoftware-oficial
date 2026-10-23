import { listAuditLedgerEntries } from "@/lib/audit/audit-ledger-store";
import type { AuditCategory, AuditLedgerEntry, AuditSeverity } from "@/lib/audit/types";
import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
} from "@/lib/market-scalability-fx";
import type { BusinessIntelligencePayload } from "@/lib/analytics/types";

const LICENSE_UNIT_BRL_ANNUAL = Number.parseFloat(
  process.env.CHEMVAULT_LICENSE_UNIT_BRL_ANNUAL ?? "12000",
);

const DECRYPT_CATEGORIES = new Set<AuditCategory>([
  "vault_decrypt",
  "vault_download",
  "vault_download_blocked",
]);

const LICENSE_ISSUE_CATEGORIES = new Set<AuditCategory>([
  "license_issue",
  "license_approved",
  "api_key_minted",
]);

function lastNDaysUtc(n: number): string[] {
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(anchor);
    t.setUTCDate(anchor.getUTCDate() - i);
    days.push(t.toISOString().slice(0, 10));
  }
  return days;
}

function hourBucketsUtc(): { hour: number; label: string }[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
  }));
}

function countBySeverity(events: AuditLedgerEntry[]): Record<AuditSeverity, number> {
  const counts: Record<AuditSeverity, number> = { info: 0, warning: 0, critical: 0 };
  for (const e of events) {
    if (e.severity in counts) counts[e.severity] += 1;
  }
  return counts;
}

function computeSecurityHealth(counts: Record<AuditSeverity, number>): BusinessIntelligencePayload["securityHealth"] {
  const total = counts.info + counts.warning + counts.critical;
  if (total === 0) {
    return {
      score: 100,
      info: 0,
      warning: 0,
      critical: 0,
      statusKey: "excellent",
    };
  }

  const criticalWeight = 2.4;
  const warningWeight = 0.35;
  const penalty =
    (counts.critical / total) * 100 * criticalWeight + (counts.warning / total) * 100 * warningWeight;
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let statusKey: BusinessIntelligencePayload["securityHealth"]["statusKey"] = "excellent";
  if (score < 45 || counts.critical > counts.info) statusKey = "critical";
  else if (score < 70) statusKey = "caution";
  else if (score < 88) statusKey = "good";

  return {
    score,
    info: counts.info,
    warning: counts.warning,
    critical: counts.critical,
    statusKey,
  };
}

/** Parse and group audit-ledger events for BI charts (server-side). */
export function aggregateLedgerEvents(events: AuditLedgerEntry[], locale: string): BusinessIntelligencePayload {
  const days14 = lastNDaysUtc(14);
  const daySet = new Set(days14);

  const decryptByDayMap = new Map<string, number>();
  for (const d of days14) decryptByDayMap.set(d, 0);

  const hourMap = new Map<number, number>();
  for (const h of hourBucketsUtc()) hourMap.set(h.hour, 0);

  let licensesIssued = 0;
  let totalDecrypts = 0;

  const now = Date.now();
  const dayMs = 86_400_000;

  for (const e of events) {
    const at = new Date(e.at).getTime();
    if (Number.isNaN(at)) continue;

    if (LICENSE_ISSUE_CATEGORIES.has(e.category)) {
      licensesIssued += 1;
    }

    if (DECRYPT_CATEGORIES.has(e.category)) {
      totalDecrypts += 1;
      const day = e.at.slice(0, 10);
      if (daySet.has(day)) {
        decryptByDayMap.set(day, (decryptByDayMap.get(day) ?? 0) + 1);
      }
      if (now - at <= dayMs) {
        const hour = new Date(e.at).getUTCHours();
        hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
      }
    }
  }

  const currency = displayCurrencyForLocale(locale);
  const annualDisplay = convertBrlToDisplay(licensesIssued * LICENSE_UNIT_BRL_ANNUAL, locale);
  const severityCounts = countBySeverity(events);

  return {
    estimatedRevenue: {
      total: Math.round(annualDisplay),
      currency,
      licensesIssued,
      unitAnnualDisplay: Math.round(convertBrlToDisplay(LICENSE_UNIT_BRL_ANNUAL, locale)),
    },
    decryptVolume: {
      byDay: days14.map((day) => ({
        day,
        decrypts: decryptByDayMap.get(day) ?? 0,
      })),
      byHour: hourBucketsUtc().map(({ hour, label }) => ({
        hour,
        label,
        value: hourMap.get(hour) ?? 0,
      })),
      totalDecrypts,
    },
    securityHealth: computeSecurityHealth(severityCounts),
  };
}

export async function buildBusinessIntelligenceFromLedger(locale: string): Promise<BusinessIntelligencePayload> {
  const events = await listAuditLedgerEntries();
  return aggregateLedgerEvents(events, locale);
}
