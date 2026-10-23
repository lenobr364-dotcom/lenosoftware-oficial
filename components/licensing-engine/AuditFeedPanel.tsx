"use client";

import type { AuditLedgerEntry } from "@/lib/audit/types";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type AuditFeedPanelProps = {
  open: boolean;
  onClose: () => void;
  pollMs?: number;
};

function formatEvent(
  t: ReturnType<typeof useTranslations<"AuditTrail">>,
  row: AuditLedgerEntry,
): string {
  const key = `event.${row.messageKey}` as Parameters<typeof t>[0];
  return t(key, (row.messageParams ?? {}) as Record<string, string | number>);
}

export function AuditFeedPanel({ open, onClose, pollMs = 4_000 }: AuditFeedPanelProps) {
  const tAudit = useTranslations("AuditTrail");
  const t = useTranslations("SmartLicensingEngine");
  const locale = useLocale();
  const [rows, setRows] = useState<AuditLedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!open) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: "1", pageSize: "12", severity: "all", category: "all" });
      const res = await fetch(`/api/dashboard/audit/logs?${qs}`, {
        signal: ac.signal,
        credentials: "same-origin",
      });
      const json = (await res.json()) as { ok: boolean; data?: { items: AuditLedgerEntry[] } };
      if (json.ok && json.data) setRows(json.data.items);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setRows([]);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load, open, pollMs]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        aria-label={t("auditClose")}
        onClick={onClose}
      />
      <aside
        className={[
          "fixed z-50 flex flex-col border-l border-white/10 bg-[#06080f]/95 shadow-[-24px_0_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
          "inset-y-0 right-0 w-full max-w-md",
          "md:static md:z-auto md:max-w-none md:shrink-0 md:w-[22rem] md:rounded-3xl md:border md:shadow-[0_24px_80px_rgba(0,0,0,0.4)]",
        ].join(" ")}
        aria-label={t("auditPanelAria")}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white/90">{t("auditFeedTitle")}</p>
            <p className="text-xs text-white/40">{t("auditFeedSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.05] p-2 text-white/60 transition hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 [-webkit-overflow-scrolling:touch]">
          {loading && rows.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.06]" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-white/40">{t("auditFeedEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 transition hover:border-cyan-400/20 hover:bg-white/[0.07]"
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-violet-200/80">
                    {tAudit(`category_${row.category}`)}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-white/75">{formatEvent(tAudit, row)}</p>
                  <p className="mt-1.5 text-[0.65rem] tabular-nums text-white/35">
                    {new Date(row.at).toLocaleString(locale, { timeStyle: "medium", dateStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 px-4 py-2">
          <p className="text-[0.6rem] uppercase tracking-wider text-cyan-300/50">{t("auditLiveHint")}</p>
        </div>
      </aside>
    </>
  );
}

