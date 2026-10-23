"use client";

import { formatAnalyticsMoney } from "@/lib/analytics/dashboard-metrics.builder";
import type { BusinessIntelligencePayload } from "@/lib/analytics/types";
import { Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type EstimatedRevenueCardProps = {
  data: BusinessIntelligencePayload["estimatedRevenue"];
  loading?: boolean;
};

export function EstimatedRevenueCard({ data, loading }: EstimatedRevenueCardProps) {
  const t = useTranslations("AnalyticsMetrics");
  const locale = useLocale();

  return (
    <section
      className="relative flex h-full min-h-[16rem] flex-col justify-between overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.04] to-transparent p-5 shadow-[0_0_60px_rgba(52,211,153,0.1)] backdrop-blur-xl md:p-6"
      aria-label={t("biRevenueAria")}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="nx-type-eyebrow text-[0.58rem] text-emerald-300/80">{t("biRevenueEyebrow")}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{t("biRevenueTitle")}</h3>
          <p className="mt-1 text-xs text-white/45">{t("biRevenueSubtitle")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/15 text-emerald-200">
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="relative mt-6">
        <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {loading ? "…" : formatAnalyticsMoney(data.total, locale, data.currency)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {loading
            ? "—"
            : t("biRevenueMeta", {
                count: data.licensesIssued,
                unit: formatAnalyticsMoney(data.unitAnnualDisplay, locale, data.currency),
              })}
        </p>
      </div>
    </section>
  );
}


