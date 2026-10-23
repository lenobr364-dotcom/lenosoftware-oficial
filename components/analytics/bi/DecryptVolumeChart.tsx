"use client";

import { GlassChartShell, glassTooltipStyle } from "@/components/analytics/GlassChartShell";
import type { BiDecryptChartPoint, BusinessIntelligencePayload } from "@/lib/analytics/types";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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

type DecryptVolumeChartProps = {
  volume: BusinessIntelligencePayload["decryptVolume"];
};

export function DecryptVolumeChart({ volume }: DecryptVolumeChartProps) {
  const t = useTranslations("AnalyticsMetrics");
  const [mode, setMode] = useState<"day" | "hour">("day");

  const chartData = useMemo((): BiDecryptChartPoint[] => {
    if (mode === "hour") {
      return volume.byHour.map((p) => ({ label: p.label, value: p.value }));
    }
    return volume.byDay.map((p) => ({
      label: formatDay(p.day),
      value: p.decrypts,
    }));
  }, [mode, volume.byDay, volume.byHour]);

  return (
    <GlassChartShell
      eyebrow={t("biDecryptEyebrow")}
      title={t("biDecryptTitle")}
      subtitle={t("biDecryptSubtitle", { total: volume.totalDecrypts })}
      ariaLabel={t("biDecryptAria")}
      accent="cyan"
      heightClass="h-[min(18rem,50vw)] md:h-80"
    >
      <div className="mb-2 flex justify-end gap-1 px-4">
        <button
          type="button"
          onClick={() => setMode("day")}
          className={[
            "rounded-lg px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider",
            mode === "day" ? "bg-cyan-500/20 text-cyan-100" : "text-white/40 hover:text-white/70",
          ].join(" ")}
        >
          {t("biDecryptModeDay")}
        </button>
        <button
          type="button"
          onClick={() => setMode("hour")}
          className={[
            "rounded-lg px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider",
            mode === "hour" ? "bg-cyan-500/20 text-cyan-100" : "text-white/40 hover:text-white/70",
          ].join(" ")}
        >
          {t("biDecryptModeHour")}
        </button>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cvDecryptBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(148,163,184,0.8)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval={mode === "hour" ? 2 : "preserveStartEnd"}
          />
          <YAxis
            allowDecimals={false}
            width={28}
            tick={{ fill: "rgba(148,163,184,0.8)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={glassTooltipStyle()}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value) => [value ?? "—", t("biDecryptSeries")]}
          />
          <Bar dataKey="value" fill="url(#cvDecryptBar)" radius={[6, 6, 0, 0]} maxBarSize={mode === "hour" ? 14 : 28} />
          {mode === "day" ? (
            <Line
              type="monotone"
              dataKey="value"
              stroke="#67e8f9"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </GlassChartShell>
  );
}

