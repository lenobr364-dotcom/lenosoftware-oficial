"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AssetDemandDatum = {
  name: string;
  count: number;
};

type AssetDemandChartProps = {
  data: AssetDemandDatum[];
  title: string;
  subtitle: string;
  emptyHint: string;
  tooltipRequestsLabel: string;
};

export function AssetDemandChart({
  data,
  title,
  subtitle,
  emptyHint,
  tooltipRequestsLabel,
}: AssetDemandChartProps) {
  const reactId = useId();
  const gradientId = `assetDemandGrad-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_0_48px_rgba(251,191,36,0.06)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
        <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{subtitle}</p>
      </div>

      <div className="px-3 pb-2 pt-4 sm:px-6 sm:pb-4">
        {data.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center px-4">
            <p className="max-w-sm text-center text-sm leading-relaxed text-neutral-500">{emptyHint}</p>
          </div>
        ) : (
          <div className="h-[min(22.5rem,52vh)] w-full min-h-[17.5rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
                barCategoryGap="18%"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fcd34d" stopOpacity={0.98} />
                    <stop offset="45%" stopColor="#f59e0b" stopOpacity={0.92} />
                    <stop offset="100%" stopColor="#78350f" stopOpacity={0.88} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(163,163,163,0.95)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={68}
                />
                <YAxis
                  tick={{ fill: "rgba(115,115,115,0.95)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "rgba(251,191,36,0.07)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const value = payload[0]?.value;
                    return (
                      <div className="rounded-xl border border-amber-400/35 bg-black/90 px-3.5 py-2.5 shadow-[0_12px_44px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                        <p className="max-w-[220px] text-[0.65rem] font-semibold uppercase leading-snug tracking-[0.18em] text-amber-100/95">
                          {label}
                        </p>
                        <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-sm text-neutral-100">
                          <span className="tabular-nums text-amber-300">{value as number}</span>
                          <span className="text-xs font-medium tracking-wide text-neutral-400">
                            {tooltipRequestsLabel}
                          </span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" fill={`url(#${gradientId})`} radius={[7, 7, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
