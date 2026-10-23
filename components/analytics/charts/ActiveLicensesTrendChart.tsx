"use client";

import { GlassChartShell, glassTooltipStyle } from "@/components/analytics/GlassChartShell";
import type { AnalyticsTimePoint } from "@/lib/analytics/types";
import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDay(isoDay: string): string {
  const [, m, d] = isoDay.split("-").map(Number);
  if (!m || !d) return isoDay;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

export function ActiveLicensesTrendChart({ points }: { points: AnalyticsTimePoint[] }) {
  const t = useTranslations("AnalyticsMetrics");
  const data = points.map((p) => ({ ...p, label: formatDay(p.day) }));

  return (
    <GlassChartShell
      eyebrow={t("activeTrendEyebrow")}
      title={t("activeTrendTitle")}
      subtitle={t("activeTrendSubtitle")}
      ariaLabel={t("activeTrendAria")}
      accent="cyan"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cvActiveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(148,163,184,0.8)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={{ fill: "rgba(148,163,184,0.8)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={glassTooltipStyle()}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value) => [value ?? "—", t("activeTrendSeries")]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#cvActiveFill)"
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "#67e8f9" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassChartShell>
  );
}
