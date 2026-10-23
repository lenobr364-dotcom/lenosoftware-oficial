/**
 * Serviço de domínio — dashboard do laboratório com formatação internacional.
 */

import { fetchLabDashboardRawStats } from "@/lib/db/repositories/lab-dashboard.repository";
import {
  formatMoney,
  formatNumber,
  formatRelativeTime,
  headquartersLabel,
  nowInTimezone,
  resolveLocaleContext,
  type LocaleContext,
} from "@/lib/intl";

export type LabDashboardMetric = {
  id: string;
  labelKey: string;
  value: string;
  hintKey: string;
  trend?: "up" | "neutral" | "down";
};

export type LabDashboardLicenseRow = {
  id: string;
  client: string;
  formula: string;
  validUntil: string;
  createdAgo: string;
};

export type LabDashboardPayload = {
  locale: string;
  regionId: string;
  timezone: string;
  headquarters: string;
  serverTime: { utc: string; local: string };
  metrics: {
    formulas: LabDashboardMetric;
    licensed: LabDashboardMetric;
    activeLicenses: LabDashboardMetric;
    pipeline: LabDashboardMetric;
  };
  recentLicenses: LabDashboardLicenseRow[];
  performance: {
    dbPingMs: number;
    cacheUsed: boolean;
    queries: Array<{ label: string; durationMs: number }>;
  };
};

const PIPELINE_BRL_BASE = 12_500;

export async function buildLabDashboardPayload(localeInput?: string | null): Promise<{
  ctx: LocaleContext;
  payload: LabDashboardPayload;
  cacheUsed: boolean;
}> {
  const ctx = resolveLocaleContext(localeInput);
  const raw = await fetchLabDashboardRawStats();
  const cacheUsed = raw.queryTimings.some((q) => q.label === "cache");

  const licensedRate = raw.totalFormulas > 0 ? raw.licensedFormulas / raw.totalFormulas : 0;
  const pipeline = formatMoney(PIPELINE_BRL_BASE, ctx);

  const payload: LabDashboardPayload = {
    locale: ctx.locale,
    regionId: ctx.regionId,
    timezone: ctx.timezone,
    headquarters: headquartersLabel(ctx),
    serverTime: nowInTimezone(ctx),
    metrics: {
      formulas: {
        id: "formulas",
        labelKey: "metricFormulas",
        value: formatNumber(raw.totalFormulas, ctx),
        hintKey: "metricFormulasHint",
        trend: "neutral",
      },
      licensed: {
        id: "licensed",
        labelKey: "metricLicensed",
        value: formatPercentDisplay(licensedRate, ctx),
        hintKey: "metricLicensedHint",
        trend: licensedRate >= 0.5 ? "up" : "neutral",
      },
      activeLicenses: {
        id: "licenses",
        labelKey: "metricActiveLicenses",
        value: formatNumber(raw.activeIndustrialLicenses, ctx),
        hintKey: "metricActiveLicensesHint",
        trend: "up",
      },
      pipeline: {
        id: "pipeline",
        labelKey: "metricPipeline",
        value: pipeline.formatted,
        hintKey: "metricPipelineHint",
        trend: "up",
      },
    },
    recentLicenses: raw.recentLicenses.map((row) => ({
      id: row.id,
      client: row.clientSubject,
      formula: row.formulaCode,
      validUntil: formatDateShort(row.validUntil, ctx),
      createdAgo: formatRelativeTime(row.createdAt, ctx),
    })),
    performance: {
      dbPingMs: raw.dbPingMs,
      cacheUsed,
      queries: raw.queryTimings,
    },
  };

  return { ctx, payload, cacheUsed };
}

function formatPercentDisplay(rate: number, ctx: LocaleContext): string {
  return new Intl.NumberFormat(ctx.bcp47, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(rate);
}

function formatDateShort(date: Date, ctx: LocaleContext): string {
  return new Intl.DateTimeFormat(ctx.bcp47, {
    dateStyle: "short",
    timeZone: ctx.timezone,
  }).format(date);
}
