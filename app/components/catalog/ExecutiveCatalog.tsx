"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  CATALOG_SEGMENTS,
  PUBLIC_FORMULATIONS,
  type CatalogSegment,
  type PublicFormulation,
} from "@/lib/catalog/public-formulations";

const CURRENCIES = ["BRL", "USD", "EUR"] as const;

function money(value: number, currency: (typeof CURRENCIES)[number]): string {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : currency === "EUR" ? "de-DE" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function readyLiters(formula: PublicFormulation, concentrateLiters: number): number | null {
  if (formula.yieldMode === "sealed") return null;
  if (formula.yieldMode === "diluted" && formula.waterPerLiter != null) {
    return concentrateLiters * (1 + formula.waterPerLiter);
  }
  return concentrateLiters;
}

export function ExecutiveCatalog() {
  const t = useTranslations("Catalog");
  const [selectedId, setSelectedId] = useState(PUBLIC_FORMULATIONS[1]?.id ?? PUBLIC_FORMULATIONS[0].id);
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("BRL");
  const [price, setPrice] = useState("18");
  const [liters, setLiters] = useState("100");
  const [benchmark, setBenchmark] = useState("");

  const selected = PUBLIC_FORMULATIONS.find((item) => item.id === selectedId) ?? PUBLIC_FORMULATIONS[0];
  const priceValue = Number(price);
  const literValue = Number(liters);
  const benchmarkValue = Number(benchmark);

  const result = useMemo(() => {
    if (!Number.isFinite(priceValue) || priceValue < 0 || !Number.isFinite(literValue) || literValue <= 0) {
      return null;
    }
    const volume = readyLiters(selected, literValue);
    if (volume == null || volume <= 0) return null;
    const costPerLiter = (priceValue * literValue) / volume;
    const savings =
      Number.isFinite(benchmarkValue) && benchmarkValue > 0 ? (benchmarkValue - costPerLiter) * volume : null;
    return { volume, costPerLiter, savings };
  }, [benchmarkValue, literValue, priceValue, selected]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="max-w-3xl">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#10B981]">{t("eyebrow")}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f4f1ea] md:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-sm leading-7 text-[#f4f1ea]/70 md:text-base">{t("intro")}</p>
      </header>

      {CATALOG_SEGMENTS.map((segment) => {
        const items = PUBLIC_FORMULATIONS.filter((item) => item.segment === segment);
        if (items.length === 0) return null;
        return (
          <section key={segment} aria-labelledby={`segment-${segment}`}>
            <h3 id={`segment-${segment}`} className="mb-4 text-xs uppercase tracking-[0.22em] text-[#D4AF37]">
              {t(`segments.${segment}`)}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((formula) => (
                <article key={formula.id} className="cv-glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-medium text-[#f4f1ea]">{formula.name}</h4>
                    <span className="shrink-0 rounded-full border border-[#10B981]/40 px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#10B981]">
                      {t(`segments.${formula.segment as CatalogSegment}`)}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm text-[#f4f1ea]/75">
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("ph")}</dt>
                      <dd className="mt-1">{formula.ph ?? t("phReserved")}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("dilution")}</dt>
                      <dd className="mt-1">{formula.usage ?? t("dilutionSealed")}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("actives")}</dt>
                      <dd className="mt-1">{formula.actives.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("ghs")}</dt>
                      <dd className="mt-1">{t("ghsSealed")}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("proportions")}</dt>
                      <dd className="mt-1">{t("proportionsSealed")}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setSelectedId(formula.id)}
                    className="mt-5 text-xs uppercase tracking-[0.16em] text-[#10B981] underline-offset-4 hover:underline"
                  >
                    {t("useInCalculator")}
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="cv-glass rounded-3xl p-6 md:p-8" aria-labelledby="yield-calculator">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#10B981]">{t("calculatorEyebrow")}</p>
        <h2 id="yield-calculator" className="mt-3 text-2xl font-semibold text-[#f4f1ea]">
          {t("calculatorTitle")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f4f1ea]/70">{t("calculatorNote")}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-[#f4f1ea]/80">
            {t("formula")}
            <select
              value={selected.id}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[#f4f1ea]"
            >
              {PUBLIC_FORMULATIONS.map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-[#f4f1ea]/80">
            {t("currency")}
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[#f4f1ea]"
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-[#f4f1ea]/80">
            {t("price")}
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[#f4f1ea]"
            />
          </label>
          <label className="text-sm text-[#f4f1ea]/80">
            {t("liters")}
            <input
              inputMode="decimal"
              value={liters}
              onChange={(event) => setLiters(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[#f4f1ea]"
            />
          </label>
          <label className="text-sm text-[#f4f1ea]/80 md:col-span-2">
            {t("benchmark")}
            <input
              inputMode="decimal"
              value={benchmark}
              onChange={(event) => setBenchmark(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-[#f4f1ea]"
            />
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-black/25 p-5">
          {selected.yieldMode === "sealed" || result == null ? (
            <p className="text-sm leading-7 text-[#f4f1ea]/75">{t("calculatorSealed")}</p>
          ) : (
            <dl className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("readyVolume")}</dt>
                <dd className="mt-1 text-xl text-[#f4f1ea]">
                  {result.volume.toLocaleString(undefined, { maximumFractionDigits: 1 })} L
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("costPerLiter")}</dt>
                <dd className="mt-1 text-xl text-[#10B981]">{money(result.costPerLiter, currency)}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-[#D4AF37]/80">{t("savings")}</dt>
                <dd className="mt-1 text-xl text-[#f4f1ea]">
                  {result.savings == null ? "—" : money(result.savings, currency)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}
