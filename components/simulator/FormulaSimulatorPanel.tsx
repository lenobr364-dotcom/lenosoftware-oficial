"use client";

import { GlassSimulatorLogPanel } from "@/components/simulator/GlassSimulatorLogPanel";
import { GlassSimulatorProgress } from "@/components/simulator/GlassSimulatorProgress";
import { ValidationStatusBadge } from "@/components/simulator/ValidationStatusBadge";
import { GlassButton, GlassMetric, GlassPanel } from "@/components/lab/design-system";
import { FORMULAS_CATALOG } from "@/lib/formulas-catalog";
import type { FormulaSimulatorReport } from "@/lib/simulator/types";
import { Beaker, MapPin, Play, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const LOG_STEP_MS = 280;

export function FormulaSimulatorPanel() {
  const t = useTranslations("FormulaSimulator");
  const locale = useLocale();
  const [formulaId, setFormulaId] = useState(FORMULAS_CATALOG[0]?.id ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [report, setReport] = useState<FormulaSimulatorReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 },
    );
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (isCancelled) {
        return;
      }

      void requestGeo();
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [requestGeo]);

  async function runSimulation() {
    if (!formulaId) return;
    setRunning(true);
    setError(null);
    setReport(null);
    setProgress(0);
    setVisibleLogs(0);

    try {
      const res = await fetch("/api/dashboard/simulator/run", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaId,
          locale,
          coordinates: coords,
        }),
      });
      const json = (await res.json()) as { ok: boolean; report?: FormulaSimulatorReport; error?: string };
      if (!res.ok || !json.ok || !json.report) {
        setError(t("runError"));
        setRunning(false);
        return;
      }

      const full = json.report;
      const total = full.logs.length;
      let step = 0;
      const timer = window.setInterval(() => {
        step += 1;
        setVisibleLogs(step);
        setProgress(Math.round((step / Math.max(total, 1)) * 100));
        if (step >= total) {
          window.clearInterval(timer);
          setReport(full);
          setRunning(false);
        }
      }, LOG_STEP_MS);
    } catch {
      setError(t("runError"));
      setRunning(false);
    }
  }

  const thermalStatusKey =
    report?.thermal.status === "ESTÁVEL"
      ? "stable"
      : report?.thermal.status === "ALERTA_CRÍTICO"
        ? "caution"
        : "critical";

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nx-type-eyebrow text-[0.6rem] text-violet-300/80">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("title")}</h2>
          <p className="mt-2 max-w-3xl text-sm text-white/50">{t("subtitle")}</p>
        </div>
      </header>

      {error ? (
        <GlassPanel padding="md" className="border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-200/90">{error}</p>
          <span className="sr-only">error</span>
        </GlassPanel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <GlassPanel padding="md" className="border-white/10">
            <p className="text-sm font-semibold text-white/85">{t("controlsTitle")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                  {t("selectFormula")}
                </span>
                <select
                  value={formulaId}
                  onChange={(e) => setFormulaId(e.target.value)}
                  disabled={running}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 text-sm text-white backdrop-blur-xl focus:border-violet-400/35 focus:outline-none"
                >
                  {FORMULAS_CATALOG.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0a0c12]">
                      {f.name} · {f.code}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs text-white/55">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400/80" />
                    {t("geoLabel")}
                  </p>
                  <button
                    type="button"
                    onClick={requestGeo}
                    className="text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-300/80 hover:text-cyan-200"
                  >
                    {t("geoRefresh")}
                  </button>
                </div>
                <p className="mt-2 nx-type-mono text-xs text-white/70">
                  {geoStatus === "ok" && coords
                    ? t("geoCoords", { lat: coords.lat.toFixed(4), lng: coords.lng.toFixed(4) })
                    : geoStatus === "loading"
                      ? t("geoLoading")
                      : t("geoUnavailable")}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <GlassButton
                type="button"
                disabled={running || !formulaId}
                onClick={() => void runSimulation()}
                className="inline-flex items-center gap-2"
              >
                {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? t("running") : t("runSimulation")}
              </GlassButton>
            </div>
          </GlassPanel>

          <GlassSimulatorProgress progress={running ? progress : report ? 100 : 0} />

          <GlassSimulatorLogPanel
            logs={report?.logs ?? []}
            visibleCount={running ? visibleLogs : report?.logs.length ?? 0}
          />
        </div>

        <aside className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 via-white/[0.04] to-cyan-500/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-black/30">
                  <Beaker className="h-5 w-5 text-violet-200" />
                </span>
                <div>
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    {t("reportTitle")}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {report?.formulaName ?? t("reportPending")}
                  </p>
                </div>
              </div>

              {report ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <ValidationStatusBadge kind="stability" status={report.stabilityStatus} />
                    <ValidationStatusBadge kind="overall" status={report.overallPassed ? "passed" : "failed"} />
                  </div>

                  <section className="grid gap-3" aria-label={t("metricsAria")}>
                    <GlassMetric
                      label={t("metricStability")}
                      value={`${report.stabilityIndex}%`}
                      hint={t(`stabilityHint_${report.stabilityStatus}`)}
                    />
                    <GlassMetric
                      label={t("metricThermal")}
                      value={report.thermal.safetyIndex}
                      hint={t("metricThermalHint", { margin: report.thermal.thermalMarginCelsius })}
                    />
                  </section>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/60 backdrop-blur-md">
                    <p className="font-semibold uppercase tracking-wider text-white/45">{t("technicalReport")}</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex justify-between gap-2">
                        <span>{t("reportCompliance")}</span>
                        <ValidationStatusBadge
                          kind="compliance"
                          status={report.compliance.isCompliant ? "passed" : "failed"}
                        />
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>{t("reportRegional")}</span>
                        <ValidationStatusBadge kind="regional" status={report.regional.verdict} />
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>{t("reportLicense")}</span>
                        <ValidationStatusBadge kind="license" status={report.license.licenseStatus} />
                      </li>
                      <li className="flex justify-between gap-2">
                        <span>{t("reportThermal")}</span>
                        <ValidationStatusBadge kind="stability" status={thermalStatusKey} />
                      </li>
                    </ul>
                    <p className="mt-3 border-t border-white/10 pt-3 text-white/50">
                      {t(report.regional.notesKey as Parameters<typeof t>[0])}
                    </p>
                    <p className="mt-2 text-white/40">
                      {t("reportFrameworks")}:{" "}
                      {report.regional.frameworkKeys
                        .map((k) => t(k as Parameters<typeof t>[0]))
                        .join(" · ")}
                    </p>
                    {!report.compliance.isCompliant &&
                      report.compliance.violations.map((v) => (
                        <p key={v.ingredient} className="mt-2 text-rose-200/80">
                          {t("violationLine", {
                            ingredient: v.ingredient,
                            current: v.current,
                            limit: v.limit,
                          })}
                        </p>
                      ))}
                    <p className="mt-3 text-[0.65rem] uppercase tracking-wider text-white/35">
                      {t(report.license.verdictKey as Parameters<typeof t>[0])}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/40">{t("reportEmpty")}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
