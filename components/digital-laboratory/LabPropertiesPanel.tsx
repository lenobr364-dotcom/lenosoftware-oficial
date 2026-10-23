"use client";

import { LabBenchControls } from "@/components/digital-laboratory/LabBenchControls";
import { GlassPanel } from "@/components/lab/design-system";
import { findInventoryItem } from "@/lib/digital-laboratory/catalog";
import type { LabInventoryItem, WorkbenchComponent } from "@/lib/digital-laboratory/types";
import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

type LabPropertiesPanelProps = {
  inventoryItem: LabInventoryItem | null;
  workbenchComponent: WorkbenchComponent | null;
  workbenchCount: number;
  onUpdateComponent: (instanceId: string, patch: Partial<WorkbenchComponent>) => void;
  onSimulateMix: () => void;
  onClearBench: () => void;
};

export function LabPropertiesPanel({
  inventoryItem,
  workbenchComponent,
  workbenchCount,
  onUpdateComponent,
  onSimulateMix,
  onClearBench,
}: LabPropertiesPanelProps) {
  const t = useTranslations("DigitalLaboratory");

  const showWorkbench = workbenchComponent !== null;
  const item =
    inventoryItem ??
    (workbenchComponent ? findInventoryItem(workbenchComponent.itemId) : undefined) ??
    null;

  return (
    <GlassPanel
      padding="none"
      variant="elevated"
      className="flex h-full min-h-[28rem] flex-col overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:min-h-0"
      aria-label={t("propertiesAria")}
    >
      <div className="border-b border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
        <p className="nx-type-eyebrow text-[0.58rem] text-fuchsia-300/80">{t("propertiesEyebrow")}</p>
        <h2 className="mt-1 text-base font-semibold text-white">{t("propertiesTitle")}</h2>
        <p className="mt-1 text-xs text-white/45">{t("propertiesSubtitle")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!item && workbenchCount === 0 ? (
          <p className="py-10 text-center text-sm text-white/40">{t("propertiesEmpty")}</p>
        ) : (
          <div className="space-y-5">
            {item ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-all duration-300 ease-in-out">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="nx-type-mono mt-1 text-xs text-cyan-100/55">{item.sku}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  {t(item.descriptionKey as "descWater")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[0.62rem] uppercase tracking-wider">
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-violet-100">
                    {t(`category_${item.category}`)}
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 text-white/55">
                    {t("purityLabel", { value: item.purityPct })}
                  </span>
                </div>
              </div>
            ) : null}

            {showWorkbench && workbenchComponent ? (
              <fieldset className="space-y-4">
                <legend className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  {t("advancedControls")}
                </legend>

                <label className="block">
                  <span className="text-[0.62rem] font-medium uppercase tracking-wider text-white/45">
                    {t("fieldRatio")}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={workbenchComponent.ratioPct}
                    onChange={(e) =>
                      onUpdateComponent(workbenchComponent.instanceId, {
                        ratioPct: Number(e.target.value),
                      })
                    }
                    className="mt-2 w-full accent-cyan-400 transition-all duration-300"
                  />
                  <span className="mt-1 block text-right text-sm tabular-nums text-cyan-100">
                    {workbenchComponent.ratioPct}%
                  </span>
                </label>

                <label className="block">
                  <span className="text-[0.62rem] font-medium uppercase tracking-wider text-white/45">
                    {t("fieldTemperature")}
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={workbenchComponent.temperatureC}
                    onChange={(e) =>
                      onUpdateComponent(workbenchComponent.instanceId, {
                        temperatureC: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 ease-in-out focus:border-cyan-400/40 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-[0.62rem] font-medium uppercase tracking-wider text-white/45">
                    {t("fieldAgitation")}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={600}
                    step={10}
                    value={workbenchComponent.agitationRpm}
                    onChange={(e) =>
                      onUpdateComponent(workbenchComponent.instanceId, {
                        agitationRpm: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 ease-in-out focus:border-cyan-400/40 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-[0.62rem] font-medium uppercase tracking-wider text-white/45">
                    {t("fieldNotes")}
                  </span>
                  <textarea
                    rows={3}
                    value={workbenchComponent.notes}
                    onChange={(e) =>
                      onUpdateComponent(workbenchComponent.instanceId, { notes: e.target.value })
                    }
                    placeholder={t("fieldNotesPlaceholder")}
                    className="mt-1 w-full resize-none rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-md transition-all duration-300 ease-in-out focus:border-cyan-400/40 focus:outline-none"
                  />
                </label>
              </fieldset>
            ) : null}
          </div>
        )}
      </div>

      <LabBenchControls
        hasItems={workbenchCount > 0}
        onSimulateMix={onSimulateMix}
        onClearBench={onClearBench}
      />
    </GlassPanel>
  );
}
