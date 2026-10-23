"use client";

import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
  litersToUsGallons,
  localeTagForFormat,
  LITERS_PER_US_GALLON,
  usesImperialDisplay,
} from "@/lib/market-scalability-fx";
import type { ProductLine } from "@/lib/product-line";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type ScalabilityFormulaRow = {
  id: string;
  title: string;
  productLine: ProductLine;
  costPerLiterBrl: number;
  suggestedPricePerLiterBrl: number;
  referenceBatchLiters: number;
};

function parsePositiveNumber(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return 0;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseMargin(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return 0;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 999);
}

function parseRetention(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return 0;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 100);
}

const SCALE_MULTS = [0.5, 0.75, 1, 1.25, 1.5] as const;

function productLineLabelKey(line: ProductLine): string {
  switch (line) {
    case "AUTOMOTIVE":
      return "productLineAutomotive";
    case "BAR_SOAP":
      return "productLineBarSoap";
    case "GENERAL_CLEANING":
      return "productLineGeneralCleaning";
    default:
      return "productLineGeneralCleaning";
  }
}

export function MarketScalabilitySim({
  formulas,
  defaultMarginPercent,
}: {
  formulas: ScalabilityFormulaRow[];
  defaultMarginPercent: number;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard.marketScalability");
  const td = useTranslations("Dashboard");
  const searchParams = useSearchParams();

  const [formulaId, setFormulaId] = useState(formulas[0]?.id ?? "");

  useEffect(() => {
    if (formulas.length === 0) return;
    const q = searchParams.get("formula")?.trim();
    queueMicrotask(() => {
      if (q && formulas.some((f) => f.id === q)) {
        setFormulaId(q);
        return;
      }
      setFormulaId((prev) => (formulas.some((f) => f.id === prev) ? prev : formulas[0]!.id));
    });
  }, [formulas, searchParams]);

  const [monthlyLiters, setMonthlyLiters] = useState("12000");
  const [marginPercent, setMarginPercent] = useState(() => String(defaultMarginPercent));
  const [netRetentionPercent, setNetRetentionPercent] = useState("82");

  const selected = useMemo(
    () => formulas.find((f) => f.id === formulaId) ?? formulas[0] ?? null,
    [formulas, formulaId],
  );

  const moneyFmt = useMemo(() => {
    const cur = displayCurrencyForLocale(locale);
    return new Intl.NumberFormat(localeTagForFormat(locale), {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [locale]);

  const numberFmt = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForFormat(locale), {
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  const metrics = useMemo(() => {
    if (!selected) return null;
    const L = parsePositiveNumber(monthlyLiters);
    const m = parseMargin(marginPercent);
    const netRet = parseRetention(netRetentionPercent);
    const cost = selected.costPerLiterBrl;
    const price = cost * (1 + m / 100);
    const totalCostBrl = L * cost;
    const grossRevenueBrl = L * price;
    const grossProfitBrl = grossRevenueBrl - totalCostBrl;
    const netProfitBrl = grossProfitBrl * (netRet / 100);

    const imperial = usesImperialDisplay(locale);
    const unitCostBrl = imperial ? cost * LITERS_PER_US_GALLON : cost;
    const unitPriceBrl = imperial ? price * LITERS_PER_US_GALLON : price;

    const chartPoints = SCALE_MULTS.map((mult) => {
      const liters = L * mult;
      const rev = liters * price;
      const cst = liters * cost;
      const gp = rev - cst;
      const np = gp * (netRet / 100);
      return { mult, liters, netProfitBrl: np };
    });
    const maxNet = Math.max(...chartPoints.map((p) => p.netProfitBrl), 1);

    const suggestedCatalogMargin = cost > 0 ? ((selected.suggestedPricePerLiterBrl - cost) / cost) * 100 : 0;

    return {
      L,
      m,
      netRet,
      cost,
      price,
      unitCostBrl,
      unitPriceBrl,
      imperial,
      totalCostBrl,
      grossRevenueBrl,
      grossProfitBrl,
      netProfitBrl,
      chartPoints,
      maxNet,
      suggestedCatalogMargin,
    };
  }, [selected, monthlyLiters, marginPercent, netRetentionPercent, locale]);

  function formatMoneyBrl(amountBrl: number) {
    return moneyFmt.format(convertBrlToDisplay(amountBrl, locale));
  }

  const glassPanel = [
    "rounded-[2rem] border border-white/[0.1]",
    "bg-[linear-gradient(165deg,rgba(14,14,18,0.72)_0%,rgba(8,8,12,0.78)_50%,rgba(12,12,16,0.82)_100%)]",
    "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_48px_-24px_rgba(0,0,0,0.55)]",
    "backdrop-blur-[28px] backdrop-saturate-[1.25]",
    "md:p-8",
  ].join(" ");

  const inputClass =
    "mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-md transition placeholder:text-neutral-600 focus:border-amber-200/45 focus:ring-2 focus:ring-amber-400/15";

  if (formulas.length === 0 || !selected || !metrics) {
    return (
      <div className={`${glassPanel} text-center`}>
        <p className="text-sm font-medium text-neutral-300">{t("emptyFormulas")}</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-500">{t("emptyFormulasHint")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className={glassPanel}>
        <div className="border-b border-white/[0.07] pb-6">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">{t("eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-500">{t("subtitle")}</p>
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-neutral-600">{t("currencyDisclaimer")}</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-400" htmlFor="mss-formula">
              {t("selectFormula")}
            </label>
            <select
              id="mss-formula"
              className={`${inputClass} cursor-pointer`}
              value={formulaId}
              onChange={(e) => {
                const id = e.target.value;
                setFormulaId(id);
                const f = formulas.find((x) => x.id === id);
                if (f && f.costPerLiterBrl > 0) {
                  const sug = ((f.suggestedPricePerLiterBrl - f.costPerLiterBrl) / f.costPerLiterBrl) * 100;
                  setMarginPercent(String(Math.round(sug * 10) / 10));
                }
              }}
            >
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} · {td(productLineLabelKey(f.productLine))}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[0.6875rem] text-neutral-600">
              {t("catalogHint", {
                price: formatMoneyBrl(
                  usesImperialDisplay(locale)
                    ? selected.suggestedPricePerLiterBrl * LITERS_PER_US_GALLON
                    : selected.suggestedPricePerLiterBrl,
                ),
                margin: numberFmt.format(metrics.suggestedCatalogMargin),
              })}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-400" htmlFor="mss-capacity">
              {t("capacityLabel")}
            </label>
            <p className="text-[0.6875rem] text-neutral-600">{t("capacityHint")}</p>
            <input
              id="mss-capacity"
              className={inputClass}
              inputMode="decimal"
              autoComplete="off"
              value={monthlyLiters}
              onChange={(e) => setMonthlyLiters(e.target.value)}
            />
            {usesImperialDisplay(locale) && metrics && metrics.L > 0 ? (
              <p className="mt-2 text-[0.6875rem] text-neutral-500">
                {t("capacityImperialReadout", { gal: numberFmt.format(litersToUsGallons(metrics.L)) })}
              </p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-400" htmlFor="mss-margin">
              {t("marginLabel")}
            </label>
            <p className="text-[0.6875rem] text-neutral-600">{t("marginHint")}</p>
            <input
              id="mss-margin"
              className={inputClass}
              inputMode="decimal"
              value={marginPercent}
              onChange={(e) => setMarginPercent(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-400" htmlFor="mss-net">
              {t("netRetentionLabel")}
            </label>
            <p className="text-[0.6875rem] text-neutral-600">{t("netRetentionHint")}</p>
            <input
              id="mss-net"
              className={inputClass}
              inputMode="decimal"
              value={netRetentionPercent}
              onChange={(e) => setNetRetentionPercent(e.target.value)}
            />
          </div>
        </div>
      </div>

      {metrics.L > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={glassPanel}>
            <h2 className="text-lg font-semibold text-white">{t("resultsTitle")}</h2>
            <p className="mt-1 text-xs text-neutral-500">{t("resultsSubtitle")}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {metrics.imperial ? t("unitCostImperial") : t("unitCost")}
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-amber-100/95">{formatMoneyBrl(metrics.unitCostBrl)}</dd>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {metrics.imperial ? t("unitPriceImperial") : t("unitPrice")}
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-emerald-200/95">{formatMoneyBrl(metrics.unitPriceBrl)}</dd>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 sm:col-span-2">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">{t("totalMonthlyCost")}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-white">{formatMoneyBrl(metrics.totalCostBrl)}</dd>
              </div>
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">{t("grossRevenue")}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-emerald-100">{formatMoneyBrl(metrics.grossRevenueBrl)}</dd>
              </div>
              <div className="rounded-xl border border-sky-500/15 bg-sky-500/[0.07] px-4 py-3">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sky-200/80">{t("grossProfit")}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-sky-100">{formatMoneyBrl(metrics.grossProfitBrl)}</dd>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 sm:col-span-2">
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber-200/85">{t("netProfit")}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-amber-50">{formatMoneyBrl(metrics.netProfitBrl)}</dd>
              </div>
            </dl>
          </div>

          <div className={glassPanel}>
            <h2 className="text-lg font-semibold text-white">{t("chartTitle")}</h2>
            <p className="mt-1 text-xs text-neutral-500">{t("chartSubtitle")}</p>
            <div className="mt-8 flex h-52 items-end justify-between gap-2 border-b border-white/10 px-1 pb-0 pt-2">
              {metrics.chartPoints.map((p) => {
                const hPx = Math.max(14, Math.round((p.netProfitBrl / metrics.maxNet) * 176));
                return (
                  <div key={p.mult} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full max-w-[3.25rem] rounded-t-lg bg-gradient-to-t from-amber-600/55 via-amber-400/35 to-emerald-400/35 shadow-[0_0_20px_rgba(251,191,36,0.12)] ring-1 ring-inset ring-white/10 transition-[height] duration-300"
                      style={{ height: `${hPx}px` }}
                      title={formatMoneyBrl(p.netProfitBrl)}
                    />
                    <span className="text-center text-[0.6rem] font-medium uppercase tracking-[0.08em] text-neutral-500">
                      {t("chartScale", { mult: p.mult })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-[0.6rem] text-neutral-600">
              <span>{t("chartAxisZero")}</span>
              <span>{t("chartAxisProfit")}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${glassPanel} text-center text-sm text-neutral-400`}>{t("invalidCapacity")}</div>
      )}
    </div>
  );
}
