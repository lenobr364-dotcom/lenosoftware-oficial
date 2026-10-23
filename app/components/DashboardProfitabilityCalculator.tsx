"use client";

import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
  litersToUsGallons,
  localeTagForFormat,
  LITERS_PER_US_GALLON,
  usesImperialDisplay,
} from "@/lib/market-scalability-fx";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function parseBrlInput(raw: string): number {
  const t = raw
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/R\$\s?/gi, "")
    .replace(/\s/g, "");
  if (!t) return 0;
  let cleaned = t;
  if (/,/.test(cleaned) && /\./.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/,/.test(cleaned)) {
    cleaned = cleaned.replace(",", ".");
  }
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseDecimalInput(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return 0;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function DashboardProfitabilityCalculator() {
  const locale = useLocale();
  const t = useTranslations("Dashboard");

  const [rawMaterialsCost, setRawMaterialsCost] = useState("");
  const [yieldLiters, setYieldLiters] = useState("");
  const [operationalCosts, setOperationalCosts] = useState("");
  const [marginPercent, setMarginPercent] = useState("");

  const displayFmt = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForFormat(locale), {
        style: "currency",
        currency: displayCurrencyForLocale(locale),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const numberFmt = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForFormat(locale), {
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  const metrics = useMemo(() => {
    const raw = parseBrlInput(rawMaterialsCost);
    const op = parseBrlInput(operationalCosts);
    const liters = parseDecimalInput(yieldLiters);
    const margin = parseDecimalInput(marginPercent);
    const imperial = usesImperialDisplay(locale);

    const totalBatch = raw + op;
    const costPerLiter = liters > 0 ? totalBatch / liters : null;
    const marginOk = margin >= 0 && margin < 1000;
    const suggestedPrice =
      costPerLiter != null && marginOk ? costPerLiter * (1 + margin / 100) : null;

    const volFactor = imperial ? LITERS_PER_US_GALLON : 1;
    const costBrlForDisplayUnit = costPerLiter != null ? costPerLiter * volFactor : null;
    const suggestedBrlForDisplayUnit = suggestedPrice != null ? suggestedPrice * volFactor : null;

    return {
      imperial,
      costPerLiter,
      suggestedPrice,
      costBrlForDisplayUnit,
      suggestedBrlForDisplayUnit,
      yieldLiters: liters,
      hasAnyInput:
        rawMaterialsCost.trim() !== "" ||
        yieldLiters.trim() !== "" ||
        operationalCosts.trim() !== "" ||
        marginPercent.trim() !== "",
      invalidYield: yieldLiters.trim() !== "" && liters <= 0,
    };
  }, [rawMaterialsCost, yieldLiters, operationalCosts, marginPercent, locale]);

  const inputClass =
    "w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-md transition placeholder:text-neutral-600 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/15";

  const labelClass = "text-xs font-medium tracking-[0.08em] text-neutral-400/95";
  const hintClass = "mt-1 text-[0.6875rem] leading-snug text-neutral-600";

  function displayMoney(valueBrl: number | null) {
    if (valueBrl == null || !Number.isFinite(valueBrl)) return t("profitabilityCalc.dash");
    return displayFmt.format(convertBrlToDisplay(valueBrl, locale));
  }

  return (
    <div
      className={[
        "rounded-[2rem] border border-white/[0.08]",
        "bg-[linear-gradient(165deg,rgba(14,14,16,0.72)_0%,rgba(8,8,10,0.78)_50%,rgba(12,12,14,0.82)_100%)]",
        "p-6 shadow-[0_2px_4px_rgba(0,0,0,0.35),0_20px_48px_-24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_0.5px_rgba(255,255,255,0.04)]",
        "backdrop-blur-[32px] backdrop-saturate-[1.3]",
        "md:p-8",
      ].join(" ")}
    >
      <div className="border-b border-white/[0.06] pb-6 md:pb-7">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-amber-200/70">{t("profitabilityCalc.eyebrow")}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">{t("profitabilityCalc.title")}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">{t("profitabilityCalc.subtitle")}</p>
        <p className="mt-2 max-w-2xl text-[0.7rem] leading-relaxed text-neutral-600">{t("profitabilityCalc.vaultBrlDisclaimer")}</p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div>
          <label className={labelClass} htmlFor="calc-raw-materials">
            {t("profitabilityCalc.rawMaterialsLabel")}
          </label>
          <p className={hintClass}>{t("profitabilityCalc.rawMaterialsHint")}</p>
          <input
            id="calc-raw-materials"
            className={`${inputClass} mt-2`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={rawMaterialsCost}
            onChange={(e) => setRawMaterialsCost(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-yield">
            {t("profitabilityCalc.yieldLabel")}
          </label>
          <p className={hintClass}>{t("profitabilityCalc.yieldHint")}</p>
          <input
            id="calc-yield"
            className={`${inputClass} mt-2`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={yieldLiters}
            onChange={(e) => setYieldLiters(e.target.value)}
          />
          {metrics.imperial && metrics.yieldLiters > 0 ? (
            <p className="mt-2 text-[0.6875rem] text-neutral-500">
              {t("profitabilityCalc.yieldImperialReadout", {
                gal: numberFmt.format(litersToUsGallons(metrics.yieldLiters)),
              })}
            </p>
          ) : null}
          {metrics.invalidYield && <p className="mt-2 text-xs text-rose-300/90">{t("profitabilityCalc.invalidYield")}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-operational">
            {t("profitabilityCalc.operationalLabel")}
          </label>
          <p className={hintClass}>{t("profitabilityCalc.operationalHint")}</p>
          <input
            id="calc-operational"
            className={`${inputClass} mt-2`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0,00"
            value={operationalCosts}
            onChange={(e) => setOperationalCosts(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-margin">
            {t("profitabilityCalc.marginLabel")}
          </label>
          <p className={hintClass}>{t("profitabilityCalc.marginHint")}</p>
          <input
            id="calc-margin"
            className={`${inputClass} mt-2`}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div
          className={[
            "rounded-2xl border border-white/[0.07] bg-black/40 px-5 py-5",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
            metrics.hasAnyInput ? "ring-1 ring-amber-200/10" : "",
          ].join(" ")}
        >
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-amber-200/75">
            {metrics.imperial ? t("profitabilityCalc.costPerUsGalTitle") : t("profitabilityCalc.costPerLiter")}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
            {displayMoney(metrics.costBrlForDisplayUnit)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {metrics.imperial ? t("profitabilityCalc.perUsGal") : t("profitabilityCalc.perLiter")}
          </p>
        </div>
        <div
          className={[
            "rounded-2xl border border-white/[0.07] bg-black/40 px-5 py-5",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
            metrics.hasAnyInput ? "ring-1 ring-emerald-400/12" : "",
          ].join(" ")}
        >
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
            {metrics.imperial ? t("profitabilityCalc.suggestedPerUsGalTitle") : t("profitabilityCalc.suggestedPrice")}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-emerald-50 sm:text-3xl">
            {displayMoney(metrics.suggestedBrlForDisplayUnit)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {metrics.imperial ? t("profitabilityCalc.perUsGal") : t("profitabilityCalc.perLiter")}
          </p>
        </div>
      </div>
    </div>
  );
}
