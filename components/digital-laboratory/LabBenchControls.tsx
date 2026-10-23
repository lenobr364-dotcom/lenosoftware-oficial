"use client";

import { FlaskConical, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

type LabBenchControlsProps = {
  hasItems: boolean;
  onSimulateMix: () => void;
  onClearBench: () => void;
};

const radiantBase =
  "relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40";

export function LabBenchControls({ hasItems, onSimulateMix, onClearBench }: LabBenchControlsProps) {
  const t = useTranslations("DigitalLaboratory");

  return (
    <div className="border-t border-white/10 bg-gradient-to-t from-violet-500/[0.06] to-transparent px-4 py-4 backdrop-blur-xl">
      <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-white/40">
        {t("benchControlsTitle")}
      </p>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!hasItems}
          onClick={onSimulateMix}
          className={[
            radiantBase,
            "border-cyan-400/35 bg-gradient-to-r from-cyan-500/25 via-violet-500/15 to-emerald-500/20 text-cyan-50",
            "shadow-[0_0_40px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
            "hover:scale-[1.03] hover:border-cyan-300/50 hover:shadow-[0_0_56px_rgba(34,211,238,0.28)]",
            "active:scale-[0.98]",
          ].join(" ")}
        >
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"
            aria-hidden
          />
          <span className="relative flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-200" aria-hidden />
            {t("simulateMix")}
          </span>
        </button>
        <button
          type="button"
          disabled={!hasItems}
          onClick={onClearBench}
          className={[
            radiantBase,
            "border-rose-400/25 bg-gradient-to-r from-rose-500/15 via-white/[0.04] to-rose-500/10 text-rose-100/90",
            "shadow-[0_0_32px_rgba(244,63,94,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]",
            "hover:scale-[1.03] hover:border-rose-400/40 hover:shadow-[0_0_48px_rgba(244,63,94,0.18)]",
            "active:scale-[0.98]",
          ].join(" ")}
        >
          <span className="relative flex items-center justify-center gap-2">
            <FlaskConical className="h-4 w-4" aria-hidden />
            {t("clearBench")}
          </span>
        </button>
      </div>
    </div>
  );
}
