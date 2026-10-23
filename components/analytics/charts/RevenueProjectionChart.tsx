"use client";

import { GlassChartShell, glassTooltipStyle } from "@/components/analytics/GlassChartShell";
import { formatAnalyticsMoney } from "@/lib/analytics/dashboard-metrics.builder";
import type { AnalyticsRevenuePoint } from "@/lib/analytics/types";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatMonth(key: string): string {
  const [y, m] = key.split("-");
  if (!y || !m) return key;
  return `${m}/${y.slice(2)}`;
}

export function RevenueProjectionChart({
  points,
  currency,
}: {
  points: AnalyticsRevenuePoint[];
  currency: string;
}) {
  const t = useTranslations("AnalyticsMetrics");
  const locale = useLocale();
  const data = points.map((p) => ({
    ...p,
    label: formatMonth(p.month),
  }));

  return (
    <GlassChartShell
      eyebrow={t("revenueEyebrow")}
      title={t("revenueTitle")}
      subtitle={t("revenueSubtitle")}
      ariaLabel={t("revenueAria")}
      accent="gold"
      heightClass="h-[min(22rem,55vw)] md:h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            width={56}
            tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              formatAnalyticsMoney(Number(v), locale, currency).replace(/\s/g, "\u00a0")
            }
          />
          <Tooltip
            contentStyle={glassTooltipStyle()}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value, name) => [
              formatAnalyticsMoney(Number(value ?? 0), locale, currency),
              name === "actual" ? t("revenueActual") : t("revenueProjected"),
            ]}
          />
          <Bar
            dataKey="projected"
            name="projected"
            fill="rgba(251,191,36,0.35)"
            stroke="rgba(251,191,36,0.65)"
            strokeWidth={1}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Bar
            dataKey="actual"
            name="actual"
            fill="rgba(52,211,153,0.75)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </GlassChartShell>
  );
}
