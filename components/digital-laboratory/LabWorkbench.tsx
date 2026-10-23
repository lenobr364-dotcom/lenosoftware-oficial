"use client";

import { GlassPanel } from "@/components/lab/design-system";
import { findInventoryItem } from "@/lib/digital-laboratory/catalog";
import type { WorkbenchBlendSummary, WorkbenchComponent } from "@/lib/digital-laboratory/types";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type LabWorkbenchProps = {
  components: WorkbenchComponent[];
  selectedInstanceId: string | null;
  enteringInstanceId: string | null;
  summary: WorkbenchBlendSummary;
  onSelectInstance: (instanceId: string) => void;
  onRemoveInstance: (instanceId: string) => void;
};

export function LabWorkbench({
  components,
  selectedInstanceId,
  enteringInstanceId,
  summary,
  onSelectInstance,
  onRemoveInstance,
}: LabWorkbenchProps) {
  const t = useTranslations("DigitalLaboratory");

  return (
    <GlassPanel
      padding="none"
      variant="elevated"
      className="flex h-full min-h-[32rem] flex-col overflow-hidden border border-white/10 shadow-[0_32px_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl lg:min-h-0"
      aria-label={t("workbenchAria")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/[0.06] via-transparent to-violet-500/[0.06] px-4 py-4 backdrop-blur-xl sm:px-5">
        <div>
          <p className="nx-type-eyebrow text-[0.58rem] text-cyan-300/80">{t("workbenchEyebrow")}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{t("workbenchTitle")}</h2>
          <p className="mt-1 text-xs text-white/45">{t("workbenchSubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-xl border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-wider text-white/55 backdrop-blur-md">
            {t("blendComponents", { count: summary.componentCount })}
          </span>
          <span
            className={[
              "inline-flex items-center rounded-xl border px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-wider backdrop-blur-md",
              summary.totalRatioPct === 100
                ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/12 text-amber-100",
            ].join(" ")}
          >
            {t("blendRatio", { value: summary.totalRatioPct })}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(34,211,238,0.08), transparent 45%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.08), transparent 40%)",
          }}
        />

        {components.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-cyan-400/25 bg-cyan-500/5 text-cyan-200/60 backdrop-blur-md">
              <Plus className="h-8 w-8" aria-hidden />
            </span>
            <p className="max-w-sm text-sm text-white/50">{t("workbenchEmpty")}</p>
          </div>
        ) : (
          <ul className="relative flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
            {components.map((comp, index) => {
              const item = findInventoryItem(comp.itemId);
              const selected = selectedInstanceId === comp.instanceId;
              return (
                <li
                  key={comp.instanceId}
                  className={
                    enteringInstanceId === comp.instanceId
                      ? "animate-in fade-in slide-in-from-left-4 zoom-in-95 duration-300 ease-out"
                      : ""
                  }
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectInstance(comp.instanceId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectInstance(comp.instanceId);
                      }
                    }}
                    className={[
                      "group flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur-md",
                      "transition-all duration-300 ease-in-out hover:scale-[1.01] hover:border-cyan-400/20",
                      selected
                        ? "border-cyan-400/35 bg-cyan-500/10 shadow-[0_0_32px_rgba(34,211,238,0.14)]"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]",
                      enteringInstanceId === comp.instanceId
                        ? "shadow-[0_0_48px_rgba(34,211,238,0.22)] ring-1 ring-cyan-400/40"
                        : "",
                    ].join(" ")}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-white/25" aria-hidden />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-xs font-bold text-cyan-200">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-white/90">{item?.name ?? comp.itemId}</span>
                      <span className="mt-0.5 flex flex-wrap gap-2 text-[0.65rem] text-white/45">
                        <span>{t("fieldRatio")}: {comp.ratioPct}%</span>
                        <span>{t("fieldTemperature")}: {comp.temperatureC}°C</span>
                        <span>{t("fieldAgitation")}: {comp.agitationRpm} rpm</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveInstance(comp.instanceId);
                      }}
                      className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-2 text-rose-200/80 opacity-60 transition-all duration-300 ease-in-out hover:scale-105 hover:opacity-100"
                      aria-label={t("removeComponent")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </GlassPanel>
  );
}

