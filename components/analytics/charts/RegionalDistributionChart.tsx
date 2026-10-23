"use client";

import { GlassChartShell, glassTooltipStyle } from "@/components/analytics/GlassChartShell";
import type { AnalyticsRegionalSlice } from "@/lib/analytics/types";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BAR_COLORS = [
  "rgba(34,211,238,0.85)",
  "rgba(167,139,250,0.8)",
  "rgba(52,211,153,0.75)",
  "rgba(251,191,36,0.75)",
  "rgba(244,114,182,0.7)",
  "rgba(96,165,250,0.7)",
];

export function RegionalDistributionChart({ slices }: { slices: AnalyticsRegionalSlice[] }) {
  const t = useTranslations("AnalyticsMetrics");
  const data = slices.length ? slices : [{ regionKey: "—", label: "—", count: 0 }];

  return (
    <GlassChartShell
      eyebrow={t("regionEyebrow")}
      title={t("regionTitle")}
      subtitle={t("regionSubtitle")}
      ariaLabel={t("regionAria")}
      accent="violet"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval={0}
            angle={-28}
            textAnchor="end"
            height={56}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={glassTooltipStyle()}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value) => [value ?? "—", t("regionSeries")]}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={entry.regionKey} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassChartShell>
  );
}
