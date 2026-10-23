"use client";

import type { AuditLedgerEntry, AuditSeverity } from "@/lib/audit/types";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";

export type LiveLedgerViewerHandle = {
  refresh: () => Promise<void>;
};

type LiveLedgerViewerProps = {
  pollMs?: number;
};

function formatEvent(
  t: ReturnType<typeof useTranslations<"AuditTrail">>,
  row: AuditLedgerEntry,
): string {
  const key = `event.${row.messageKey}` as Parameters<typeof t>[0];
  return t(key, (row.messageParams ?? {}) as Record<string, string | number>);
}

function severityStyles(severity: AuditSeverity): string {
  if (severity === "critical") {
    return [
      "border-rose-500/50 bg-rose-950/40 text-rose-100",
      "shadow-[0_0_24px_rgba(244,63,94,0.35)]",
      "animate-pulse",
    ].join(" ");
  }
  if (severity === "warning") {
    return "border-amber-400/35 bg-amber-950/30 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.12)]";
  }
  return "border-emerald-400/28 bg-emerald-950/25 text-emerald-100";
}

function severityDot(severity: AuditSeverity): string {
  if (severity === "critical") return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]";
  if (severity === "warning") return "bg-amber-400";
  return "bg-emerald-400";
}

export const LiveLedgerViewer = forwardRef<LiveLedgerViewerHandle, LiveLedgerViewerProps>(
  function LiveLedgerViewer({ pollMs = 2_500 }, ref) {
    const t = useTranslations("SimulationHub");
    const tAudit = useTranslations("AuditTrail");
    const locale = useLocale();
    const [rows, setRows] = useState<AuditLedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const load = useCallback(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ page: "1", pageSize: "40", severity: "all", category: "all" });
        const res = await fetch(`/api/dashboard/audit/logs?${qs}`, {
          signal: ac.signal,
          credentials: "same-origin",
        });
        const json = (await res.json()) as { ok: boolean; data?: { items: AuditLedgerEntry[] } };
        if (!res.ok || !json.ok || !json.data) {
          setError(t("ledgerLoadError"));
          setRows([]);
          return;
        }
        setRows(json.data.items);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(t("ledgerLoadError"));
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, [t]);

    useImperativeHandle(ref, () => ({ refresh: load }), [load]);

    useEffect(() => {
      void load();
      const id = window.setInterval(() => void load(), pollMs);
      return () => {
        window.clearInterval(id);
        abortRef.current?.abort();
      };
    }, [load, pollMs]);

    return (
      <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-white/90">{t("ledgerTitle")}</p>
          <p className="text-xs text-white/40">{t("ledgerSubtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-white/10 px-4 py-2 text-[0.6rem] uppercase tracking-wider text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {t("severityInfo")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {t("severityWarning")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            {t("severityCritical")}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 [-webkit-overflow-scrolling:touch]">
          {error ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.06]" />
              ))}
            </div>
          ) : null}
          {!loading && rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">{t("ledgerEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={[
                    "rounded-2xl border px-3 py-2.5 transition",
                    severityStyles(row.severity),
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot(row.severity)}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider">
                          {tAudit(`severity_${row.severity}`)}
                        </span>
                        <span className="text-[0.62rem] uppercase tracking-wide text-white/50">
                          {tAudit(`category_${row.category}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-snug">{formatEvent(tAudit, row)}</p>
                      <p className="mt-1.5 nx-type-mono text-[0.6rem] text-white/45">
                        {t("ledgerLicense", { id: row.resource })}
                      </p>
                      <p className="text-[0.6rem] tabular-nums text-white/35">
                        {new Date(row.at).toLocaleString(locale, {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
);

