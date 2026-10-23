"use client";

import type { FinanceKpis } from "@/lib/formulas";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRow = {
  name: string;
  cost: number;
  profit: number;
};

type Props = {
  locale: string;
  kpis: FinanceKpis;
  chartRows: ChartRow[];
};

function eur(n: number, locale: string) {
  const tag =
    locale === "pt" ? "pt-PT" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function eurFine(n: number, locale: string) {
  const tag =
    locale === "pt" ? "pt-PT" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
}

function pct(n: number, locale: string) {
  const tag =
    locale === "pt" ? "pt-PT" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }).format(n) + "%";
}

export function MarketIntelligenceClient({ locale, kpis, chartRows }: Props) {
  const t = useTranslations("MarketIntel");

  return (
    <div className="space-y-10">
      <header className="text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-yellow-500/75">{t("eyebrow")}</p>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight text-transparent md:text-5xl"
          style={{
            backgroundImage: "linear-gradient(120deg, #fde68a 0%, #d4a84b 35%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">{t("subtitle")}</p>
        <p className="mt-2 font-mono text-xs text-emerald-400/80">{t("brandTag")}</p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <KpiCard
          label={t("kpiAvgMargin")}
          value={pct(kpis.avgMarginPercent, locale)}
          hint={t("kpiAvgMarginHint")}
          accent="emerald"
        />
        <KpiCard
          label={t("kpiInventoryCost")}
          value={eur(kpis.totalInventoryCost, locale)}
          hint={t("kpiInventoryCostHint")}
          accent="gold"
        />
        <KpiCard
          label={t("kpiRevenue")}
          value={eur(kpis.revenueProjection, locale)}
          hint={t("kpiRevenueHint")}
          accent="emerald"
        />
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_48px_rgba(16,185,129,0.06)] backdrop-blur-xl md:p-8">
        <h2 className="text-lg font-semibold text-white md:text-xl">{t("chartTitle")}</h2>
        <p className="mt-1 text-xs text-gray-500">{t("chartSubtitle")}</p>
        <div className="mt-8 h-[320px] w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 4, bottom: 8 }} barGap={6}>
              <CartesianGrid strokeDasharray="4 6" stroke="rgba(55,65,81,0.45)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "rgba(75,85,99,0.5)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `€${v}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  backgroundColor: "rgba(10,10,12,0.96)",
                  border: "1px solid rgba(212,175,90,0.25)",
                  borderRadius: 12,
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const n = typeof value === "number" ? value : Number(value);
                  const label = name === "cost" ? t("legendCost") : t("legendProfit");
                  return [eurFine(Number.isFinite(n) ? n : 0, locale), label];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (value === "cost" ? t("legendCost") : t("legendProfit"))}
              />
              <Bar
                dataKey="cost"
                name="cost"
                fill="rgba(212, 175, 90, 0.55)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="profit"
                name="profit"
                fill="rgba(52, 211, 153, 0.88)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "gold";
}) {
  const border =
    accent === "emerald"
      ? "border-emerald-500/25 shadow-[0_0_36px_rgba(16,185,129,0.12)]"
      : "border-yellow-500/25 shadow-[0_0_36px_rgba(234,179,8,0.10)]";
  const valueClass =
    accent === "emerald" ? "text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.25)]" : "text-amber-200 drop-shadow-[0_0_18px_rgba(234,179,8,0.2)]";

  return (
    <article
      className={`rounded-2xl border bg-gradient-to-b from-white/[0.06] to-transparent p-6 backdrop-blur-md ${border}`}
    >
      <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tabular-nums md:text-3xl ${valueClass}`}>{value}</p>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">{hint}</p>
    </article>
  );
}
