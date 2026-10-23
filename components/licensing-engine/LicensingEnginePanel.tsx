"use client";

import { AuditFeedPanel } from "@/components/licensing-engine/AuditFeedPanel";
import { GlassLicenseTable } from "@/components/licensing-engine/GlassLicenseTable";
import { VaultUnlockModal } from "@/components/licensing-engine/VaultUnlockModal";
import { GlassButton, GlassMetric, GlassPanel } from "@/components/lab/design-system";
import {
  approveLicense,
  decryptVaultPayload,
  fetchLicenses,
  issueLicense,
  revokeLicense,
} from "@/lib/licensing-engine/api-client";
import type { DecryptPayloadSuccess } from "@/lib/licensing/api-types";
import type { FormulaLicenseRow, LicensingEnginePage } from "@/lib/licensing-engine/types";
import type { LicenseEngineStatus } from "@/lib/licensing-engine/types";
import { FORMULAS } from "@/lib/formulas";
import { ChevronLeft, ChevronRight, PanelRightOpen, RefreshCw, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type StatusFilter = LicenseEngineStatus | "all";

export function LicensingEnginePanel() {
  const t = useTranslations("SmartLicensingEngine");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [data, setData] = useState<LicensingEnginePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [unlockResult, setUnlockResult] = useState<DecryptPayloadSuccess | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [clientSubject, setClientSubject] = useState("");
  const [formulaCode, setFormulaCode] = useState(FORMULAS[0]?.code ?? "");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const json = await fetchLicenses({ page, pageSize: 20, status: statusFilter });
      if (ac.signal.aborted) return;
      if (!json.ok || !("data" in json)) {
        setError(t("loadError"));
        setData(null);
        return;
      }
      setData(json.data);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError(t("loadError"));
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, [page, statusFilter, t]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  async function handleApprove(licenseId: string) {
    setBusyId(licenseId);
    setError(null);
    try {
      const json = await approveLicense({ licenseId });
      if (!json.ok) {
        setError(t("actionError"));
        return;
      }
      await load();
    } catch {
      setError(t("actionError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevoke(licenseId: string) {
    setBusyId(licenseId);
    setError(null);
    try {
      const json = await revokeLicense({ licenseId });
      if (!json.ok) {
        setError(t("actionError"));
        return;
      }
      await load();
    } catch {
      setError(t("actionError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnlock(row: FormulaLicenseRow) {
    setBusyId(row.id);
    setError(null);
    try {
      const json = await decryptVaultPayload({
        licenseId: row.id,
        formulaId: row.formulaId,
        locale,
      });
      if (!json.ok || !json.authorized) {
        setError(t("unlockDenied"));
        return;
      }
      setUnlockResult(json);
    } catch {
      setError(t("unlockDenied"));
    } finally {
      setBusyId(null);
    }
  }

  async function submitIssue(e: React.FormEvent) {
    e.preventDefault();
    setBusyId("issue");
    setError(null);
    try {
      const json = await issueLicense({
        clientSubject,
        formulaCode,
        validFrom: validFrom ? `${validFrom}T00:00:00.000Z` : "",
        validUntil: validUntil ? `${validUntil}T23:59:59.999Z` : "",
      });
      if (!json.ok) {
        setError(t("issueError"));
        return;
      }
      setIssueOpen(false);
      setClientSubject("");
      await load();
    } catch {
      setError(t("issueError"));
    } finally {
      setBusyId(null);
    }
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-cyan-300/75">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("title")}</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/50">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAuditOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-white"
          >
            <PanelRightOpen className="h-4 w-4" aria-hidden />
            {auditOpen ? t("auditHide") : t("auditShow")}
          </button>
          <GlassButton type="button" onClick={() => setIssueOpen((v) => !v)}>
            <ShieldCheck className="mr-2 inline h-4 w-4" aria-hidden />
            {t("issueLicense")}
          </GlassButton>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3" aria-label={t("metricsAria")}>
        <GlassMetric label={t("metricPending")} value={String(metrics?.pending ?? "—")} hint={t("metricPendingHint")} />
        <GlassMetric label={t("metricActive")} value={String(metrics?.active ?? "—")} hint={t("metricActiveHint")} />
        <GlassMetric label={t("metricRevoked")} value={String(metrics?.revoked ?? "—")} hint={t("metricRevokedHint")} />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          {issueOpen ? (
            <GlassPanel className="p-4 sm:p-5">
              <form onSubmit={(e) => void submitIssue(e)} className="space-y-4">
                <p className="text-sm font-semibold text-white/85">{t("issueFormTitle")}</p>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                    {t("fieldClient")}
                  </span>
                  <input
                    required
                    value={clientSubject}
                    onChange={(e) => setClientSubject(e.target.value)}
                    className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                    {t("fieldFormula")}
                  </span>
                  <select
                    value={formulaCode}
                    onChange={(e) => setFormulaCode(e.target.value)}
                    className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
                  >
                    {FORMULAS.map((f) => (
                      <option key={f.id} value={f.code}>
                        {f.name} ({f.code})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                      {t("fieldValidFrom")}
                    </span>
                    <input
                      required
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                      {t("fieldValidUntil")}
                    </span>
                    <input
                      required
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <GlassButton type="submit" disabled={busyId === "issue"}>
                    {busyId === "issue" ? t("actionWorking") : t("issueSubmit")}
                  </GlassButton>
                  <button
                    type="button"
                    onClick={() => setIssueOpen(false)}
                    className="rounded-xl border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
                  >
                    {t("issueCancel")}
                  </button>
                </div>
              </form>
            </GlassPanel>
          ) : null}

          <GlassPanel className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-[9rem] flex-col gap-1.5">
                <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                  {t("filterStatus")}
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/85 backdrop-blur-xl outline-none focus:border-cyan-400/35"
                >
                  <option value="all">{t("filterAll")}</option>
                  <option value="PENDING">{t("status_PENDING")}</option>
                  <option value="ACTIVE">{t("status_ACTIVE")}</option>
                  <option value="REVOKED">{t("status_REVOKED")}</option>
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
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
                {error}
              </p>
            ) : null}

            <GlassLicenseTable
              rows={data?.items ?? []}
              loading={loading}
              busyId={busyId}
              onApprove={(id) => void handleApprove(id)}
              onRevoke={(id) => void handleRevoke(id)}
              onUnlock={(row) => void handleUnlock(row)}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-xs text-white/40">
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

        {auditOpen ? <AuditFeedPanel open={auditOpen} onClose={() => setAuditOpen(false)} /> : null}
      </div>

      <VaultUnlockModal
        open={unlockResult !== null}
        result={unlockResult}
        onClose={() => setUnlockResult(null)}
      />
    </div>
  );
}
