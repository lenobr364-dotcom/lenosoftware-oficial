"use client";

import { useTranslations } from "next-intl";

type GlassSimulatorProgressProps = {
  progress: number;
  label?: string;
};

export function GlassSimulatorProgress({ progress, label }: GlassSimulatorProgressProps) {
  const t = useTranslations("FormulaSimulator");
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
          {label ?? t("progressLabel")}
        </p>
        <p className="text-sm font-bold tabular-nums text-white/90">{pct}%</p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-600/90 via-violet-500/85 to-emerald-400/80 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
