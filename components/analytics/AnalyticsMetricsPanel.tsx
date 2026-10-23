"use client";

import { BusinessIntelligenceSection } from "@/components/analytics/bi/BusinessIntelligenceSection";
import { ActiveLicensesTrendChart } from "@/components/analytics/charts/ActiveLicensesTrendChart";
import { RegionalDistributionChart } from "@/components/analytics/charts/RegionalDistributionChart";
import { RevenueProjectionChart } from "@/components/analytics/charts/RevenueProjectionChart";
import { GlassMetric, GlassPanel } from "@/components/lab/design-system";
import { formatAnalyticsMoney } from "@/lib/analytics/dashboard-metrics.builder";
import type { AnalyticsMetricsPayload } from "@/lib/analytics/types";
import { Activity, Globe2, RefreshCw, TrendingUp, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

async function fetchMetrics(locale: string, signal?: AbortSignal): Promise<AnalyticsMetricsPayload> {
  const res = await fetch(`/api/dashboard/analytics/metrics?locale=${encodeURIComponent(locale)}`, {
    credentials: "include",
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const json = (await res.json()) as { ok: boolean; data: AnalyticsMetricsPayload };
  if (!json.ok || !json.data) throw new Error("invalid_payload");
  return json.data;
}

export function AnalyticsMetricsPanel() {
  const t = useTranslations("AnalyticsMetrics");
  const locale = useLocale();
  const [data, setData] = useState<AnalyticsMetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchMetrics(locale);
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchMetrics(locale, controller.signal)
      .then(setData)
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "fetch_failed");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [locale]);

  const fmt = (n: number) =>
    data ? formatAnalyticsMoney(n, locale, data.currency) : "—";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nx-type-eyebrow text-[0.6rem] text-cyan-300/80">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("biHubTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">{t("biHubSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="nx-glass-nav-link inline-flex items-center gap-2 self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          {t("refresh")}
        </button>
      </header>

      {error ? (
        <GlassPanel padding="md" className="border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-200/90">{t("loadError")}</p>
        </GlassPanel>
      ) : null}

      <BusinessIntelligenceSection
        data={data?.businessIntelligence ?? null}
        loading={loading && !data}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("kpisAria")}>
        <GlassMetric
          label={t("kpiActiveLicenses")}
          value={loading ? "…" : String(data?.kpis.activeLicenses ?? "—")}
          hint={t("kpiActiveLicensesHint")}
          trend="up"
          icon={<Wallet className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("kpiLicensedFormulas")}
          value={loading ? "…" : String(data?.kpis.licensedFormulas ?? "—")}
          hint={t("kpiLicensedFormulasHint")}
          icon={<Activity className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("kpiGrowth")}
          value={loading ? "…" : `${data?.kpis.growthRatePct ?? 0}%`}
          hint={t("kpiGrowthHint")}
          trend={(data?.kpis.growthRatePct ?? 0) >= 0 ? "up" : "down"}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("kpiRevenueMonth")}
          value={loading ? "…" : data ? fmt(data.revenueProjection[0]?.actual ?? data.revenueProjection[0]?.projected ?? 0) : "—"}
          hint={t("kpiRevenueMonthHint")}
          icon={<Globe2 className="h-4 w-4" />}
        />
      </section>

      {data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <ActiveLicensesTrendChart points={data.activeLicenseTrend} />
          </div>
          <RegionalDistributionChart slices={data.regionalDistribution} />
          <RevenueProjectionChart points={data.revenueProjection} currency={data.currency} />
        </div>
      ) : loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <GlassPanel key={i} padding="lg" className="min-h-72 animate-pulse">
              <span className="sr-only">Loading</span>
            </GlassPanel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
