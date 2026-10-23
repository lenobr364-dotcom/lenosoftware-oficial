"use client";

import { GlassPanel } from "@/components/lab/design-system";
import type { LabComponentCategory, LabInventoryItem } from "@/lib/digital-laboratory/types";
import { Beaker, Droplets, FlaskConical, Layers, Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type LabInventorySidebarProps = {
  items: LabInventoryItem[];
  selectedItemId: string | null;
  pulseItemId: string | null;
  onInventoryClick: (id: string) => void;
};

const CATEGORY_ORDER: LabComponentCategory[] = [
  "formula",
  "surfactant",
  "solvent",
  "additive",
  "catalyst",
];

function categoryIcon(category: LabComponentCategory) {
  if (category === "formula") return FlaskConical;
  if (category === "solvent") return Droplets;
  if (category === "catalyst") return Sparkles;
  if (category === "surfactant") return Layers;
  return Beaker;
}

function hazardTone(hazard: LabInventoryItem["hazardClass"]): string {
  if (hazard === "high") return "border-rose-400/35 bg-rose-500/10 text-rose-100";
  if (hazard === "medium") return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-emerald-400/28 bg-emerald-500/10 text-emerald-100";
}

export function LabInventorySidebar({
  items,
  selectedItemId,
  pulseItemId,
  onInventoryClick,
}: LabInventorySidebarProps) {
  const t = useTranslations("DigitalLaboratory");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<LabComponentCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        t(`category_${item.category}`).toLowerCase().includes(q)
      );
    });
  }, [items, query, categoryFilter, t]);

  const grouped = useMemo(() => {
    const map = new Map<LabComponentCategory, LabInventoryItem[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <GlassPanel
      padding="none"
      variant="elevated"
      className="flex h-full min-h-[28rem] flex-col overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:min-h-0"
      aria-label={t("inventoryAria")}
    >
      <div className="border-b border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl">
        <p className="nx-type-eyebrow text-[0.58rem] text-violet-300/80">{t("inventoryEyebrow")}</p>
        <h2 className="mt-1 text-base font-semibold text-white">{t("inventoryTitle")}</h2>
        <p className="mt-1 text-xs text-white/45">{t("inventorySubtitle")}</p>
        <label className="mt-3 block">
          <span className="sr-only">{t("inventorySearch")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inventorySearch")}
            className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white transition-all duration-300 ease-in-out placeholder:text-white/35 backdrop-blur-md focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
        </label>
        <div className="mt-2 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={[
              "rounded-lg px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out",
              categoryFilter === "all" ? "bg-violet-500/25 text-violet-100" : "text-white/40 hover:scale-105 hover:text-white/70",
            ].join(" ")}
          >
            {t("filterAll")}
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={[
                "rounded-lg px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out",
                categoryFilter === cat ? "bg-violet-500/25 text-violet-100" : "text-white/40 hover:scale-105 hover:text-white/70",
              ].join(" ")}
            >
              {t(`category_${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-white/40">{t("inventoryEmpty")}</p>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const list = grouped.get(cat) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={cat} className="mb-4">
                <p className="px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/35">
                  {t(`category_${cat}`)}
                </p>
                <ul className="space-y-1">
                  {list.map((item) => {
                    const Icon = categoryIcon(item.category);
                    const selected = selectedItemId === item.id;
                    const pulsing = pulseItemId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onInventoryClick(item.id)}
                          className={[
                            "group w-full rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ease-in-out",
                            "hover:scale-[1.02] hover:border-cyan-400/25 hover:bg-cyan-500/[0.08] hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]",
                            "active:scale-[0.99]",
                            selected
                              ? "border-cyan-400/35 bg-cyan-500/12 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                              : "border-transparent bg-white/[0.02]",
                            pulsing ? "ring-2 ring-cyan-400/50 ring-offset-0" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/25 text-cyan-200/80 transition-transform duration-300 ease-in-out",
                                "group-hover:scale-105",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-white/90">{item.name}</span>
                              <span className="nx-type-mono mt-0.5 block text-[0.65rem] text-white/40">{item.sku}</span>
                              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex rounded-full border px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase ${hazardTone(item.hazardClass)}`}
                                >
                                  {t(`hazard_${item.hazardClass}`)}
                                </span>
                                <span className="text-[0.58rem] text-white/35">
                                  {t("purityLabel", { value: item.purityPct })}
                                </span>
                              </span>
                            </span>
                            <Plus
                              className="h-4 w-4 shrink-0 text-cyan-300/50 opacity-0 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:opacity-100"
                              aria-hidden
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
        <p className="text-[0.62rem] text-white/40">{t("inventoryHintClick")}</p>
      </div>
    </GlassPanel>
  );
}
