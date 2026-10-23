"use client";

import { AnalyticsMetricsPanel } from "@/components/analytics/AnalyticsMetricsPanel";
import { MarketIntelligenceClient } from "@/app/components/MarketIntelligenceClient";
import type { FinanceKpis } from "@/lib/formulas";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ChartRow = { name: string; cost: number; profit: number };

type AnalyticsPageClientProps = {
  locale: string;
  kpis: FinanceKpis;
  chartRows: ChartRow[];
};

type TabId = "metrics" | "market";

export function AnalyticsPageClient({ locale, kpis, chartRows }: AnalyticsPageClientProps) {
  const t = useTranslations("AnalyticsMetrics");
  const [tab, setTab] = useState<TabId>("metrics");

  return (
    <div className="space-y-8">
      <nav
        className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl"
        aria-label={t("tabsAria")}
      >
        {(
          [
            { id: "metrics" as const, label: t("tabMetrics") },
            { id: "market" as const, label: t("tabMarket") },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={[
              "rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
              tab === id
                ? "bg-cyan-500/20 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "text-white/45 hover:bg-white/[0.06] hover:text-white/75",
            ].join(" ")}
            aria-current={tab === id ? "true" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "metrics" ? (
        <AnalyticsMetricsPanel />
      ) : (
        <MarketIntelligenceClient locale={locale} kpis={kpis} chartRows={chartRows} />
      )}
    </div>
  );
}
