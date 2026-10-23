"use client";

import { glassPanelDense, tableGlassBodyRow, tableGlassHeadRow, tableGlassWrap } from "@/lib/ui-glass";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type FormulaAuditApiEntry = {
  id: string;
  formulaId: string;
  action: string;
  actorSubject: string | null;
  requestId: string | null;
  createdAt: string;
  snapshotBeforePreview: string | null;
  snapshotAfterPreview: string | null;
};

export function FormulaAuditPanel() {
  const t = useTranslations("Dashboard.adminMonitor.formulaAudit");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [actor, setActor] = useState("");
  const [formulaId, setFormulaId] = useState("");
  const [entries, setEntries] = useState<FormulaAuditApiEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (from.trim()) p.set("from", from.trim());
      if (to.trim()) p.set("to", to.trim());
      if (actor.trim()) p.set("actor", actor.trim());
      if (formulaId.trim()) p.set("formulaId", formulaId.trim());
      const qs = p.toString();
      const res = await fetch(`/api/admin/formula-audit${qs ? `?${qs}` : ""}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        setError(t("loadError"));
        setEntries([]);
        return;
      }
      const j = (await res.json()) as { ok?: boolean; entries?: FormulaAuditApiEntry[] };
      setEntries(Array.isArray(j.entries) ? j.entries : []);
    } catch {
      setError(t("loadError"));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, actor, formulaId, t]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filters apply on button; initial load uses default state
  }, []);

  return (
    <section className={`space-y-4 p-6 ${glassPanelDense}`}>
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/90">{t("title")}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-neutral-500">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[140px] flex-col gap-1 text-[0.65rem] font-medium uppercase tracking-wider text-neutral-500">
          {t("labelFrom")}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40"
          />
        </label>
        <label className="flex min-w-[140px] flex-col gap-1 text-[0.65rem] font-medium uppercase tracking-wider text-neutral-500">
          {t("labelTo")}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40"
          />
        </label>
        <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-[0.65rem] font-medium uppercase tracking-wider text-neutral-500">
          {t("labelActor")}
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="ceo@…"
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500/40"
          />
        </label>
        <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[0.65rem] font-medium uppercase tracking-wider text-neutral-500">
          {t("labelFormulaId")}
          <input
            type="text"
            value={formulaId}
            onChange={(e) => setFormulaId(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[0.65rem] text-white outline-none focus:border-violet-500/40"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-full border border-violet-500/35 bg-violet-500/15 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-violet-100 transition hover:bg-violet-500/25 disabled:opacity-50"
        >
          {loading ? t("loading") : t("apply")}
        </button>
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      <div className={`max-h-[480px] overflow-auto ${tableGlassWrap}`}>
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className={`sticky top-0 z-[1] text-[0.6rem] uppercase tracking-widest text-neutral-400 ${tableGlassHeadRow}`}>
            <tr>
              <th className="px-2 pb-2 pr-2 pt-2">{t("colTime")}</th>
              <th className="px-2 pb-2 pr-2 pt-2">{t("colAction")}</th>
              <th className="px-2 pb-2 pr-2 pt-2">{t("colActor")}</th>
              <th className="px-2 pb-2 pr-2 pt-2">{t("colFormula")}</th>
              <th className="px-2 pb-2 pr-2 pt-2">{t("colBefore")}</th>
              <th className="px-2 pb-2 pt-2">{t("colAfter")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  {t("empty")}
                </td>
              </tr>
            ) : null}
            {entries.map((row) => (
              <tr key={row.id} className={tableGlassBodyRow}>
                <td className="py-2 pr-2 align-top text-neutral-500">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="py-2 pr-2 align-top font-semibold text-amber-200/90">{row.action}</td>
                <td className="max-w-[140px] py-2 pr-2 align-top font-mono text-[0.65rem] text-white/75">
                  {row.actorSubject ?? "—"}
                </td>
                <td className="max-w-[100px] py-2 pr-2 align-top font-mono text-[0.6rem] text-cyan-200/80">
                  {row.formulaId.length > 16 ? `${row.formulaId.slice(0, 12)}…` : row.formulaId}
                </td>
                <td className="max-w-[200px] py-2 pr-2 align-top text-[0.65rem] text-neutral-400">
                  {row.snapshotBeforePreview ?? "—"}
                </td>
                <td className="max-w-[200px] py-2 align-top text-[0.65rem] text-neutral-400">
                  {row.snapshotAfterPreview ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
