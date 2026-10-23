"use client";

import { GlassAuditLedgerTable } from "@/components/audit/GlassAuditLedgerTable";
import { GlassMetric, GlassPanel } from "@/components/lab/design-system";
import type { AuditCategory, AuditLedgerEntry, AuditSeverity, AuditTrailPage } from "@/lib/audit/types";
import { ChevronLeft, ChevronRight, RefreshCw, ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type Filters = {
  category: AuditCategory | "all";
  severity: AuditSeverity | "all";
};

export function AuditTrailPanel() {
  const t = useTranslations("AuditTrail");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ category: "all", severity: "all" });
  const [data, setData] = useState<AuditTrailPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({
      page: String(page),
      pageSize: "25",
      category: filters.category,
      severity: filters.severity,
    });
    try {
      const res = await fetch(`/api/dashboard/audit/logs?${qs}`, {
        signal: ac.signal,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const json = (await res.json()) as { ok: boolean; data?: AuditTrailPage; error?: string };
      if (!res.ok || !json.ok || !json.data) {
        setError(json.error ?? "load_failed");
        setData(null);
        return;
      }
      setData(json.data);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("load_failed");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [filters.category, filters.severity, page]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.severity]);

  const rows: AuditLedgerEntry[] = data?.items ?? [];
  const criticalCount = rows.filter((r) => r.severity === "critical").length;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-rose-300/75">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("title")}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-white/50">{t("subtitle")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3" aria-label={t("metricsAria")}>
        <GlassMetric label={t("metricTotal")} value={String(data?.total ?? "—")} hint={t("metricTotalHint")} />
        <GlassMetric label={t("metricPage")} value={data ? `${data.page}/${data.totalPages}` : "—"} hint={t("metricPageHint")} />
        <GlassMetric
          label={t("metricCritical")}
          value={loading ? "…" : String(criticalCount)}
          hint={t("metricCriticalHint")}
        />
      </div>

      <GlassPanel className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[10rem] flex-col gap-1.5">
            <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">{t("filterCategory")}</span>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as Filters["category"] }))}
              className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
            >
              <option value="all">{t("filterAll")}</option>
              <option value="vault_download">{t("category_vault_download")}</option>
              <option value="vault_download_blocked">{t("category_vault_download_blocked")}</option>
              <option value="api_key_minted">{t("category_api_key_minted")}</option>
              <option value="api_key_revoked">{t("category_api_key_revoked")}</option>
              <option value="simulator_compliance_fail">{t("category_simulator_compliance_fail")}</option>
              <option value="simulator_run">{t("category_simulator_run")}</option>
              <option value="security_event">{t("category_security_event")}</option>
              <option value="compliance_certificate">{t("category_compliance_certificate")}</option>
              <option value="compliance_audit_export">{t("category_compliance_audit_export")}</option>
            </select>
          </label>
          <label className="flex min-w-[9rem] flex-col gap-1.5">
            <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">{t("filterSeverity")}</span>
            <select
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value as Filters["severity"] }))}
              className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
            >
              <option value="all">{t("filterAll")}</option>
              <option value="info">{t("severity_info")}</option>
              <option value="warning">{t("severity_warning")}</option>
              <option value="critical">{t("severity_critical")}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            {t("refresh")}
          </button>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">{t("loadError")}</p>
        ) : null}

        <GlassAuditLedgerTable rows={rows} loading={loading} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40">
            <ScrollText className="mr-1.5 inline h-3.5 w-3.5 opacity-60" aria-hidden />
            {t("paginationSummary", {
              from: data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0,
              to: data ? Math.min(data.page * data.pageSize, data.total) : 0,
              total: data?.total ?? 0,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data?.hasPrev || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 backdrop-blur-xl transition hover:bg-white/[0.09] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t("prevPage")}
            </button>
            <button
              type="button"
              disabled={!data?.hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 backdrop-blur-xl transition hover:bg-white/[0.09] disabled:opacity-40"
            >
              {t("nextPage")}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}


