import type { ReactNode } from "react";
import { GlassPanel } from "./glass-panel";

export type GlassMetricProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: "up" | "neutral" | "down";
};

const trendColor = {
  up: "text-emerald-400",
  neutral: "text-cyan-300",
  down: "text-amber-400",
};

export function GlassMetric({ label, value, hint, icon, trend = "neutral" }: GlassMetricProps) {
  return (
    <GlassPanel padding="sm" className="nx-glass-panel--floating min-h-[8.5rem]">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          {icon ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-300/90 shadow-[var(--nx-glass-shadow-soft)]">
              {icon}
            </span>
          ) : (
            <span className="h-10 w-10 shrink-0" aria-hidden />
          )}
          <p className="nx-type-eyebrow text-right text-[0.58rem]">{label}</p>
        </div>
        <div>
          <p className={`text-2xl font-semibold tracking-tight sm:text-[1.65rem] ${trendColor[trend]}`}>
            {value}
          </p>
          {hint ? <p className="nx-type-body mt-1.5 text-xs">{hint}</p> : null}
        </div>
      </div>
    </GlassPanel>
  );
}
