"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";

export type LicenseGrowthPoint = { day: string; requests: number };

function formatDay(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  if (!y || !m || !d) return isoDay;
  return `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

export function LicenseGrowthGlassChart({ points }: { points: LicenseGrowthPoint[] }) {
  const t = useTranslations("Dashboard");
  const data = points.map((p) => ({ ...p, label: formatDay(p.day) }));

  return (
    <section
      className={[
        "relative mb-10 overflow-hidden rounded-3xl border border-cyan-400/20",
        "bg-gradient-to-br from-white/[0.08] via-cyan-500/[0.04] to-fuchsia-500/[0.05]",
        "shadow-[0_0_60px_rgba(34,211,238,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]",
        "backdrop-blur-xl",
      ].join(" ")}
      aria-label={t("licenseTrendAria")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.1),transparent_45%)]" />

      <div className="relative border-b border-white/[0.08] px-6 py-5 md:px-8">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{t("licenseTrendEyebrow")}</p>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white md:text-2xl">{t("licenseTrendTitle")}</h2>
        <p className="mt-1 max-w-2xl text-xs text-neutral-400 md:text-sm">{t("licenseTrendSubtitle")}</p>
      </div>

      <div className="relative h-[min(22rem,55vw)] w-full px-2 pb-6 pt-2 md:h-80 md:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cvLicenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="cvLicenseStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(148,163,184,0.85)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              width={36}
              tick={{ fill: "rgba(148,163,184,0.85)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(34,211,238,0.25)",
                borderRadius: "12px",
                boxShadow: "0 0 24px rgba(34,211,238,0.15)",
              }}
              labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
              formatter={(value) => [value ?? "—", t("licenseTrendTooltipSeries")]}
            />
            <Area
              type="monotone"
              dataKey="requests"
              name={t("licenseTrendTooltipSeries")}
              stroke="url(#cvLicenseStroke)"
              strokeWidth={2.2}
              fill="url(#cvLicenseFill)"
              dot={false}
              activeDot={{ r: 5, fill: "#67e8f9", stroke: "#a855f7", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
