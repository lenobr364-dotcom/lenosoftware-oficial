"use client";

import type { SimulatorLogEntry } from "@/lib/simulator/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

function levelClass(level: SimulatorLogEntry["level"]): string {
  switch (level) {
    case "success":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-100/90";
    case "warn":
      return "border-amber-400/20 bg-amber-500/10 text-amber-100/90";
    case "error":
      return "border-rose-400/20 bg-rose-500/10 text-rose-100/90";
    default:
      return "border-white/10 bg-white/[0.03] text-white/70";
  }
}

type GlassSimulatorLogPanelProps = {
  logs: SimulatorLogEntry[];
  visibleCount: number;
};

export function GlassSimulatorLogPanel({ logs, visibleCount }: GlassSimulatorLogPanelProps) {
  const t = useTranslations("FormulaSimulator");
  const locale = useLocale();
  const endRef = useRef<HTMLDivElement>(null);
  const visible = logs.slice(0, visibleCount);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [visibleCount]);

  return (
    <div className="flex h-[22rem] flex-col overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white/90">{t("logsTitle")}</p>
        <p className="text-xs text-white/40">{t("logsSubtitle")}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[0.7rem] leading-relaxed">
        {visible.length === 0 ? (
          <p className="px-2 py-6 text-center text-white/35">{t("logsEmpty")}</p>
        ) : (
          <ul className="space-y-1.5">
            {visible.map((entry) => (
              <li
                key={entry.id}
                className={[
                  "rounded-lg border px-2.5 py-1.5 backdrop-blur-md transition-all duration-200",
                  levelClass(entry.level),
                ].join(" ")}
              >
                <span className="text-white/35">
                  {new Date(entry.at).toLocaleTimeString(locale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className="mx-2 text-white/25">·</span>
                <span>{t(entry.messageKey as Parameters<typeof t>[0], entry.messageParams)}</span>
              </li>
            ))}
          </ul>
        )}
        <div ref={endRef} aria-hidden />
      </div>
    </div>
  );
}
