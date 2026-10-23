"use client";

import { CertificatePreviewModal } from "@/components/compliance/CertificatePreviewModal";
import { ComplianceLicenseTable } from "@/components/compliance/ComplianceLicenseTable";
import { GlassButton, GlassMetric, GlassPanel } from "@/components/lab/design-system";
import {
  downloadComplianceExport,
  exportComplianceAuditReport,
  fetchComplianceLicenses,
  generateComplianceCertificate,
} from "@/lib/compliance/api-client";
import type { ComplianceCertificatePayload } from "@/lib/compliance/types";
import type { LicensingEnginePage } from "@/lib/licensing-engine/types";
import { ChevronLeft, ChevronRight, Download, FileCheck, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

export function CompliancePanel() {
  const t = useTranslations("ComplianceExport");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LicensingEnginePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<ComplianceCertificatePayload | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const json = await fetchComplianceLicenses({ page, pageSize: 20 });
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
  }, [page, t]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  async function handleGenerateCertificate(licenseId: string) {
    setBusyId(licenseId);
    setError(null);
    setSuccess(null);
    try {
      const json = await generateComplianceCertificate({ licenseId });
      if (!json.ok) {
        if (json.error === "license_not_certifiable") setError(t("error_license_not_certifiable"));
        else if (json.error === "license_not_found") setError(t("error_license_not_found"));
        else setError(t("certError"));
        return;
      }
      setCertificate(json.certificate);
      setSuccess(t("certGenerated", { documentId: json.certificate.documentId }));
    } catch {
      setError(t("certError"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleExportAudit(format: "csv" | "json") {
    setExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const json = await exportComplianceAuditReport({ format });
      if (!json.ok) {
        setError(t("exportError"));
        return;
      }
      downloadComplianceExport(json.export);
      setSuccess(t("exportSuccess", { documentId: json.export.documentId, count: json.export.rowCount }));
    } catch {
      setError(t("exportError"));
    } finally {
      setExporting(false);
    }
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="nx-type-eyebrow text-[0.6rem] text-teal-300/80">{t("eyebrow")}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => void load()}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {t("refresh")}
            </GlassButton>
            <GlassButton
              type="button"
              variant="primary"
              disabled={exporting}
              onClick={() => void handleExportAudit("csv")}
              className="inline-flex items-center gap-2 border-teal-400/30 bg-teal-500/15 hover:bg-teal-500/25"
            >
              <Download className="h-4 w-4" aria-hidden />
              {exporting ? t("exporting") : t("exportAuditCsv")}
            </GlassButton>
            <GlassButton
              type="button"
              variant="outline"
              disabled={exporting}
              onClick={() => void handleExportAudit("json")}
              className="inline-flex items-center gap-2"
            >
              <FileCheck className="h-4 w-4" aria-hidden />
              {t("exportAuditJson")}
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {error ? (
        <p className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100" role="status">
          {success}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3" aria-label={t("metricsAria")}>
        <GlassMetric label={t("metricActive")} value={String(metrics?.active ?? "—")} hint={t("metricActiveHint")} />
        <GlassMetric label={t("metricRevoked")} value={String(metrics?.revoked ?? "—")} hint={t("metricRevokedHint")} />
        <GlassMetric label={t("metricTotal")} value={String(data?.total ?? "—")} hint={t("metricTotalHint")} />
      </section>

      <ComplianceLicenseTable
        rows={data?.items ?? []}
        loading={loading}
        busyId={busyId}
        onGenerateCertificate={(id) => void handleGenerateCertificate(id)}
      />

      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-white/45">
            {t("paginationSummary", {
              page: data.page,
              totalPages: data.totalPages,
              total: data.total,
            })}
          </p>
          <div className="flex gap-2">
            <GlassButton
              type="button"
              variant="outline"
              disabled={!data.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {t("prevPage")}
            </GlassButton>
            <GlassButton
              type="button"
              variant="outline"
              disabled={!data.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1"
            >
              {t("nextPage")}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </GlassButton>
          </div>
        </div>
      ) : null}

      <CertificatePreviewModal certificate={certificate} onClose={() => setCertificate(null)} />
    </div>
  );
}

