"use client";

import {
  ACTIVITY_LOG_EVENT,
  type ActivityLogEntry,
  readActivityLogs,
} from "@/lib/activity-log";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  locale: string;
};

function formatLogTime(iso: string, locale: string) {
  const localeTag =
    locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.DateTimeFormat(localeTag, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export function ActivityLogTerminal({ locale }: Props) {
  const t = useTranslations("ActivityLog");
  const [logs, setLogs] = useState<ActivityLogEntry[]>(() => readActivityLogs());

  useEffect(() => {
    const onUpdate = () => setLogs(readActivityLogs());
    window.addEventListener(ACTIVITY_LOG_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(ACTIVITY_LOG_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-8">
      <div className="flex flex-col gap-1 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{t("title")}</h2>
          <p className="mt-1 text-xs text-gray-500">{t("subtitle")}</p>
        </div>
        <span className="mt-2 inline-flex items-center rounded-md border border-yellow-500/20 bg-yellow-500/5 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-yellow-500/80 md:mt-0">
          {t("secureChannel")}
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-800/90 bg-[#070708] shadow-[inset_0_0_0_1px_rgba(234,179,8,0.06)]">
        <div className="border-b border-gray-800/80 bg-gray-900/50 px-4 py-2">
          <p className="font-mono text-[0.65rem] leading-relaxed text-gray-500">
            <span className="text-yellow-600/90">●</span> {t("sessionLabel")}{" "}
            <span className="text-gray-600">—</span> <span className="text-gray-500">sha256 audit stream</span>
          </p>
        </div>
        <div
          className="max-h-72 min-h-[12rem] overflow-y-auto overscroll-contain px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-gray-400"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {logs.length === 0 ? (
            <p className="py-6 text-center text-gray-600">{t("empty")}</p>
          ) : (
            <ul className="space-y-2.5">
              {logs.map((entry) => (
                <li
                  key={entry.id}
                  className="border-l-2 border-yellow-500/20 py-0.5 pl-3 text-[0.72rem] leading-relaxed"
                >
                  <span className="select-none text-yellow-600/50">›</span>{" "}
                  <span className="text-gray-300">
                    {t("accessLine", {
                      role: entry.actorRole,
                      formula: entry.formulaName,
                      datetime: formatLogTime(entry.at, locale),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-gray-800/80 bg-gray-950/80 px-4 py-2">
          <p className="font-mono text-[0.65rem] text-gray-600">
            <span className="text-yellow-600/70">chemvault@audit</span>
            <span className="text-gray-600">:</span>
            <span className="text-amber-700/80">~</span>
            <span className="text-gray-600">$</span>{" "}
            <span className="text-gray-500">{t("promptHint")}</span>
            <span className="animate-pulse text-yellow-600/60">▍</span>
          </p>
        </div>
      </div>
    </section>
  );
}
