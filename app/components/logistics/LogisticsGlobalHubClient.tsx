"use client";

import { WorldMapBackdrop } from "@/app/components/logistics/WorldMapBackdrop";
import {
  freightMultiplierForMt,
  getLogisticsPort,
  LOGISTICS_PORTS,
  type LogisticsPortId,
  transitDayRange,
} from "@/lib/logistics-global-hub-data";
import { Anchor } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function localeTag(locale: string): string {
  if (locale === "pt") return "pt-BR";
  if (locale === "de") return "de-DE";
  if (locale === "hi") return "hi-IN";
  return "en-US";
}

const glassPanel = [
  "rounded-[2rem] border border-white/[0.09]",
  "bg-gradient-to-br from-white/[0.07] via-black/45 to-black/75",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_-10px_rgba(34,211,238,0.15)] backdrop-blur-2xl md:p-8",
].join(" ");

export function LogisticsGlobalHubClient() {
  const t = useTranslations("LogisticsGlobalHub");
  const locale = useLocale();
  const [portId, setPortId] = useState<LogisticsPortId>("dubai_uae");
  const [cargoMt, setCargoMt] = useState(20);
  const [declaredUsd, setDeclaredUsd] = useState(48000);

  const port = getLogisticsPort(portId);
  const nf = useMemo(() => new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 0 }), [locale]);
  const nfd = useMemo(
    () => new Intl.NumberFormat(localeTag(locale), { minimumFractionDigits: 0, maximumFractionDigits: 1 }),
    [locale],
  );
  const usd = useMemo(
    () =>
      new Intl.NumberFormat(localeTag(locale), {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const estimates = useMemo(() => {
    if (!port) return null;
    const { min, max } = transitDayRange(port, cargoMt);
    const mult = freightMultiplierForMt(cargoMt);
    const freight = cargoMt * port.freightUsdPerMt * mult;
    const duty = (declaredUsd * port.importDutyApproxPct) / 100;
    return { min, max, freight, duty };
  }, [port, cargoMt, declaredUsd]);

  const countryName = port ? t(`country_${port.countryI18nKey}`) : "";

  return (
    <div className="relative min-h-[32rem] overflow-hidden rounded-[2.5rem] border border-cyan-500/15 bg-black/50 shadow-[0_0_60px_-12px_rgba(34,211,238,0.2)]">
      <div className="absolute inset-0 opacity-90">
        <WorldMapBackdrop highlightPortId={portId} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/85"
        aria-hidden
      />

      <div className="relative z-10 grid gap-6 p-6 md:grid-cols-2 md:p-10 lg:gap-8">
        <section className={glassPanel}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200">
              <Anchor className="h-5 w-5 stroke-[1.75]" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{t("panelRoutingTitle")}</h2>
              <p className="text-xs leading-relaxed text-neutral-500">{t("panelRoutingSubtitle")}</p>
            </div>
          </div>

          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
            {t("portSelectLabel")}
            <select
              value={portId}
              onChange={(e) => setPortId(e.target.value as LogisticsPortId)}
              className="mt-2 w-full appearance-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
            >
              {LOGISTICS_PORTS.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {t(`portLabels.${p.id}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
            {t("cargoMtLabel")}
            <input
              type="number"
              min={5}
              max={200}
              step={1}
              value={Number.isNaN(cargoMt) ? "" : cargoMt}
              onChange={(e) => setCargoMt(Math.min(200, Math.max(5, Number(e.target.value) || 5)))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm tabular-nums text-white outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
            />
            <span className="mt-1.5 block text-[0.7rem] text-neutral-500">{t("cargoMtHint")}</span>
          </label>

          <label className="mt-5 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
            {t("declaredValueLabel")}
            <input
              type="number"
              min={1000}
              max={2000000}
              step={500}
              value={Number.isNaN(declaredUsd) ? "" : declaredUsd}
              onChange={(e) => setDeclaredUsd(Math.max(1000, Number(e.target.value) || 1000))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm tabular-nums text-white outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
            />
            <span className="mt-1.5 block text-[0.7rem] text-neutral-500">{t("declaredValueHint")}</span>
          </label>
        </section>

        <div className="flex flex-col gap-6">
          <section className={glassPanel}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/80">{t("estimateTitle")}</h3>
            {estimates && port ? (
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <dt className="text-neutral-400">{t("transitDays")}</dt>
                  <dd className="font-semibold tabular-nums text-white">
                    {t("transitDaysRange", { min: nf.format(estimates.min), max: nf.format(estimates.max) })}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <dt className="text-neutral-400">{t("freightTotal")}</dt>
                  <dd className="bg-gradient-to-r from-amber-100 to-cyan-100 bg-clip-text text-lg font-semibold tabular-nums text-transparent">
                    {usd.format(estimates.freight)}
                  </dd>
                </div>
                <p className="text-[0.7rem] leading-relaxed text-neutral-600">{t("freightFootnote")}</p>
              </dl>
            ) : null}
          </section>

          <section className={glassPanel}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/80">{t("importTitle")}</h3>
            {port && estimates ? (
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <dt className="text-neutral-400">{t("importRateLine", { country: countryName })}</dt>
                  <dd className="font-semibold tabular-nums text-cyan-100/90">{nfd.format(port.importDutyApproxPct)}%</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="text-neutral-400">{t("importTaxAmount")}</dt>
                  <dd className="text-lg font-semibold tabular-nums text-white">{usd.format(estimates.duty)}</dd>
                </div>
                <p className="text-[0.7rem] leading-relaxed text-neutral-600">{t("importTaxFootnote")}</p>
              </dl>
            ) : null}
          </section>
        </div>
      </div>

      <p className="relative z-10 border-t border-white/[0.06] px-6 py-4 text-center text-[0.65rem] leading-relaxed text-neutral-600 md:px-10">
        {t("disclaimer")}
      </p>
    </div>
  );
}
