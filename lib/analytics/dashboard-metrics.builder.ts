import { prisma } from "@/lib/prisma";
import { regionLabelForLocale } from "@/lib/geo/region-labels";
import { countryFromFreeText } from "@/lib/geo/region-centroids";
import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
  localeTagForFormat,
} from "@/lib/market-scalability-fx";
import { buildBusinessIntelligenceFromLedger } from "@/lib/analytics/ledger-aggregations";
import type { AnalyticsMetricsPayload } from "@/lib/analytics/types";

const PIPELINE_BRL_ANNUAL_PER_LICENSE = Number.parseFloat(
  process.env.CHEMVAULT_LICENSE_UNIT_BRL_ANNUAL ?? "12000",
);

function last30UtcDays(): string[] {
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const t = new Date(anchor);
    t.setUTCDate(anchor.getUTCDate() - i);
    days.push(t.toISOString().slice(0, 10));
  }
  return days;
}

function growthRatePct(series: number[]): number {
  if (series.length < 2) return 0;
  const firstHalf = series.slice(0, Math.floor(series.length / 2));
  const secondHalf = series.slice(Math.floor(series.length / 2));
  const a = firstHalf.reduce((s, v) => s + v, 0);
  const b = secondHalf.reduce((s, v) => s + v, 0);
  if (a === 0) return b > 0 ? 100 : 0;
  return Math.round(((b - a) / a) * 1000) / 10;
}

function monthKeysForward(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setUTCDate(1);
  for (let i = 0; i < count; i++) {
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + i, 1));
    out.push(`${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function buildAnalyticsMetricsPayload(
  localeInput?: string | null,
): Promise<AnalyticsMetricsPayload> {
  const locale = localeInput ?? "en";
  const currency = displayCurrencyForLocale(locale);
  const days = last30UtcDays();
  const since = new Date(`${days[0]}T00:00:00.000Z`);

  const [
    activeLicenses,
    licensedFormulas,
    pendingRequests,
    grantsInWindow,
    activityByRegion,
    requestsByCountry,
    requestTrend,
  ] = await Promise.all([
    prisma.formulaIndustrialLicense.count({
      where: { status: "ACTIVE", validUntil: { gt: new Date() } },
    }),
    prisma.formula.count({ where: { licenciada: true } }),
    prisma.licenseRequest.count({ where: { status: "Pendente" } }),
    prisma.formulaIndustrialLicense.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.licenseActivity.groupBy({
      by: ["region"],
      _count: { _all: true },
    }),
    prisma.licenseRequest.groupBy({
      by: ["country"],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.licenseRequest.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const grantCounts = new Map<string, number>();
  for (const d of days) grantCounts.set(d, 0);
  for (const g of grantsInWindow) {
    const key = g.createdAt.toISOString().slice(0, 10);
    grantCounts.set(key, (grantCounts.get(key) ?? 0) + 1);
  }

  const activeLicenseTrend = days.map((day) => ({ day, value: grantCounts.get(day) ?? 0 }));

  const regionalMap = new Map<string, number>();
  for (const row of activityByRegion) {
    const key = row.region || "unknown";
    regionalMap.set(key, (regionalMap.get(key) ?? 0) + row._count._all);
  }
  for (const row of requestsByCountry) {
    const key = countryFromFreeText(row.country);
    regionalMap.set(key, (regionalMap.get(key) ?? 0) + row._count._all);
  }

  const regionalDistribution = [...regionalMap.entries()]
    .map(([regionKey, count]) => ({
      regionKey,
      label: regionLabelForLocale(locale, regionKey),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const monthlyBrl = (activeLicenses * PIPELINE_BRL_ANNUAL_PER_LICENSE) / 12;
  const monthlyDisplay = convertBrlToDisplay(monthlyBrl, locale);
  const growth = growthRatePct(activeLicenseTrend.map((p) => p.value));
  const growthFactor = 1 + Math.min(0.35, Math.max(-0.15, growth / 100));

  const revenueProjection = monthKeysForward(12).map((month, idx) => {
    const projected = monthlyDisplay * growthFactor ** idx;
    const actual = idx === 0 ? monthlyDisplay : undefined;
    return { month, projected: Math.round(projected), actual: actual ? Math.round(actual) : undefined };
  });

  const businessIntelligence = await buildBusinessIntelligenceFromLedger(locale);

  return {
    locale,
    currency,
    updatedAt: new Date().toISOString(),
    kpis: {
      activeLicenses,
      licensedFormulas,
      pendingRequests,
      growthRatePct: growth,
    },
    activeLicenseTrend,
    regionalDistribution,
    revenueProjection,
    businessIntelligence,
  };
}

export function formatAnalyticsMoney(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(localeTagForFormat(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
