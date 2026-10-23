"use client";

import { glassPanel, glassPanelDense, tableGlassBodyRow, tableGlassHeadRow, tableGlassWrap } from "@/lib/ui-glass";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminBillingSnapshot } from "@/app/components/admin/AdminBillingSnapshot";
import { FormulaAuditPanel } from "@/app/components/admin/FormulaAuditPanel";
import { FormulaUsageBar, LicenseRegionBar, SecuritySeverityBar } from "@/app/components/admin/AdminMonitorCharts";
import { AdminMonitorSkeleton } from "@/app/components/skeletons/glass-skeleton";

type AdminSummaryPayload = {
  ok: true;
  windowHours: number;
  licensesByRegion: { region: string; count: number }[];
  licensePulseLast24h: number;
  formulaUsageByDay: { day: string; totalViews: number }[];
  securityBySeverity: { severity: string; count: number }[];
  billing: {
    activeLicenseTokens30d: number;
    approvedDealsByCurrency: { currencyCode: string; count: number }[];
    projectedAnnualRevenueByCurrency: { currencyCode: string; amount: number }[];
  };
};

type ActivityResponse = {
  ok: true;
  live: { id: string; subject: string; channel: string; region: string; createdAt: string }[];
  security: { id: string; type: string; severity: string; title: string; requestPath: string | null; createdAt: string }[];
};

const POLL_MS = 12_000;

export function AdminMonitorClient() {
  const t = useTranslations("Dashboard.adminMonitor");
  const [summary, setSummary] = useState<AdminSummaryPayload | null>(null);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/api/admin/summary", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/admin/activity", { cache: "no-store", credentials: "same-origin" }),
      ]);
      if (!sRes.ok || !aRes.ok) {
        setError(t("loadError"));
        setLoading(false);
        return;
      }
      const [sJson, aJson] = await Promise.all([sRes.json() as Promise<AdminSummaryPayload>, aRes.json() as Promise<ActivityResponse>]);
      setSummary(sJson);
      setActivity(aJson);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const pulseLabel = useMemo(() => {
    const n = summary?.licensePulseLast24h ?? 0;
    return t("pulse24h", { count: n });
  }, [summary, t]);

  if (loading && !summary) {
    return <AdminMonitorSkeleton />;
  }

  if (error) {
    return (
      <div className={`mx-auto max-w-7xl p-6 md:p-10 ${glassPanel}`}>
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <header className={`space-y-2 p-8 ${glassPanel}`}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/80">{pulseLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("title")}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{t("subtitle")}</p>
        <p className="text-xs text-neutral-600">{t("refreshNote")}</p>
      </header>

      {summary?.billing ? <AdminBillingSnapshot billing={summary.billing} /> : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`p-6 ${glassPanelDense}`}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/85">{t("licensesByRegion")}</h2>
          <LicenseRegionBar data={summary?.licensesByRegion ?? []} />
        </section>
        <section className={`p-6 ${glassPanelDense}`}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/85">{t("formulaUsageTitle")}</h2>
          <FormulaUsageBar data={summary?.formulaUsageByDay ?? []} />
        </section>
      </div>

      <section className={`p-6 ${glassPanelDense}`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rose-200/85">{t("securityMixTitle")}</h2>
        <SecuritySeverityBar data={summary?.securityBySeverity ?? []} />
      </section>

      <FormulaAuditPanel />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`max-h-[420px] overflow-auto p-6 ${glassPanelDense}`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/90">{t("liveFeed")}</h2>
          <div className={tableGlassWrap}>
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className={`sticky top-0 z-[1] text-[0.6rem] uppercase tracking-widest text-neutral-400 ${tableGlassHeadRow}`}>
              <tr>
                <th className="px-2 pb-2 pr-2 pt-2">{t("colSubject")}</th>
                <th className="px-2 pb-2 pr-2 pt-2">{t("colChannel")}</th>
                <th className="px-2 pb-2 pr-2 pt-2">{t("colRegion")}</th>
                <th className="px-2 pb-2 pt-2">{t("colTime")}</th>
              </tr>
            </thead>
            <tbody>
              {(activity?.live ?? []).map((row) => (
                <tr key={row.id} className={tableGlassBodyRow}>
                  <td className="py-2 pr-2 font-mono text-[0.65rem] text-white/80">{row.subject.slice(0, 28)}</td>
                  <td className="py-2 pr-2">{row.channel}</td>
                  <td className="py-2 pr-2">{row.region}</td>
                  <td className="py-2 text-neutral-500">{new Date(row.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
        <section className={`max-h-[420px] overflow-auto p-6 ${glassPanelDense}`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rose-100/90">{t("securityFeedTitle")}</h2>
          <div className={tableGlassWrap}>
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className={`sticky top-0 z-[1] text-[0.6rem] uppercase tracking-widest text-neutral-400 ${tableGlassHeadRow}`}>
              <tr>
                <th className="px-2 pb-2 pr-2 pt-2">{t("colSeverity")}</th>
                <th className="px-2 pb-2 pr-2 pt-2">{t("colTitle")}</th>
                <th className="px-2 pb-2 pt-2">{t("colTime")}</th>
              </tr>
            </thead>
            <tbody>
              {(activity?.security ?? []).map((row) => (
                <tr key={row.id} className={tableGlassBodyRow}>
                  <td className="py-2 pr-2 font-semibold text-amber-200/90">{row.severity}</td>
                  <td className="py-2 pr-2">{row.title}</td>
                  <td className="py-2 text-neutral-500">{new Date(row.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      </div>
    </div>
  );
}
