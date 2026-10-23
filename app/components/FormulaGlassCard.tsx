"use client";

import type { FormulaGlassCardData } from "@/lib/formula-glass-card-data";
import type { ProductLine } from "@/lib/product-line";
import { economicsForFormulaTitle } from "@/lib/market-scalability-economics";
import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
  litersToUsGallons,
  localeTagForFormat,
  LITERS_PER_US_GALLON,
  usesImperialDisplay,
} from "@/lib/market-scalability-fx";
import { convertMetricPhrasesInText } from "@/lib/formula-metric-display";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

export type { FormulaGlassCardData };

function formatHardwareBlock(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    const o = JSON.parse(t) as Record<string, unknown>;
    return JSON.stringify(o, null, 2);
  } catch {
    return t;
  }
}

type Props = {
  formula: FormulaGlassCardData;
};

function productLineKey(line: ProductLine): "productLineAutomotive" | "productLineBarSoap" | "productLineGeneralCleaning" {
  switch (line) {
    case "AUTOMOTIVE":
      return "productLineAutomotive";
    case "BAR_SOAP":
      return "productLineBarSoap";
    case "GENERAL_CLEANING":
      return "productLineGeneralCleaning";
  }
}

export function FormulaGlassCard({ formula }: Props) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const display = useMemo(() => {
    const imperial = usesImperialDisplay(locale);
    const raw = convertMetricPhrasesInText(formula.rawMaterials, locale);
    const prep = convertMetricPhrasesInText(formula.preparationMethod, locale);
    const dil = convertMetricPhrasesInText(formula.dilutionDetails, locale);
    const equiv =
      formula.chemicalEquivalence.trim().length > 0
        ? convertMetricPhrasesInText(formula.chemicalEquivalence.trim(), locale)
        : "";

    const e = economicsForFormulaTitle(formula.title, formula.productLine);
    const cur = displayCurrencyForLocale(locale);
    const money = new Intl.NumberFormat(localeTagForFormat(locale), {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const costPerLiterBrl = e.costPerLiterBrl;
    const pricePerLiterBrl = e.suggestedPricePerLiterBrl;

    const unitVolumeBrlCost = imperial ? costPerLiterBrl * LITERS_PER_US_GALLON : costPerLiterBrl;
    const unitVolumeBrlPrice = imperial ? pricePerLiterBrl * LITERS_PER_US_GALLON : pricePerLiterBrl;

    const costDisplay = convertBrlToDisplay(unitVolumeBrlCost, locale);
    const priceDisplay = convertBrlToDisplay(unitVolumeBrlPrice, locale);

    return {
      imperial,
      raw,
      prep,
      dil,
      equiv,
      economicsLine: money.format(costDisplay),
      economicsPrice: money.format(priceDisplay),
      refLiters: e.referenceBatchLiters,
      refGal: litersToUsGallons(e.referenceBatchLiters),
    };
  }, [formula, locale]);

  const volFmt = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForFormat(locale), {
        maximumFractionDigits: usesImperialDisplay(locale) ? 1 : 0,
      }),
    [locale],
  );

  const { imperial, raw, prep, dil, equiv, economicsLine, economicsPrice, refLiters, refGal } = display;

  const dossier = (formula.technicalDossier ?? "").trim();
  const hardware = formatHardwareBlock(formula.hardwareIntegrationProfile ?? "");
  const tags = (formula.licensingTags ?? "").trim();
  const steward = (formula.stewardAuthor ?? "").trim();

  return (
    <article
      className={[
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] p-6 sm:p-7",
        "border border-white/[0.16]",
        "bg-[linear-gradient(165deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.05)_40%,rgba(2,3,8,0.52)_100%)]",
        "backdrop-blur-[32px] backdrop-saturate-[1.4]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.22),0_18px_52px_-18px_rgba(0,0,0,0.62)]",
        "ring-1 ring-white/[0.04]",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-amber-200/42",
        "hover:shadow-[inset_0_0_68px_rgba(212,175,55,0.11),inset_0_1px_0_rgba(255,248,220,0.2),0_24px_58px_-14px_rgba(184,134,11,0.18)]",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 bg-[radial-gradient(ellipse_110%_85%_at_50%_-25%,rgba(255,236,180,0.18),transparent_55%),radial-gradient(ellipse_85%_65%_at_100%_100%,rgba(180,140,50,0.1),transparent_52%)]"
      />

      <div className="relative z-10 flex flex-1 flex-col gap-5">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200/25 bg-amber-500/10 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-amber-100/90">
              {t(productLineKey(formula.productLine))}
            </span>
            {tags ? (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-cyan-100/85">
                {tags.replace(/,/g, " · ")}
              </span>
            ) : null}
          </div>
          <h3 className="text-pretty text-xl font-semibold leading-snug tracking-tight text-white sm:text-[1.35rem]">{formula.title}</h3>
          {steward ? (
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-neutral-500">
              {t("formulaSteward")}: <span className="text-neutral-300">{steward}</span>
            </p>
          ) : null}
        </header>

        <div
          className={[
            "rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-black/35 to-amber-500/10",
            "px-4 py-3 text-[0.7rem] leading-relaxed text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md",
          ].join(" ")}
        >
          <p className="font-semibold uppercase tracking-[0.16em] text-cyan-200/85">{t("formulaEconomicsIndicative")}</p>
          <p className="mt-2 text-sm text-white/95">
            <span className="tabular-nums text-amber-100/95">{economicsLine}</span>
            <span className="text-neutral-500"> · </span>
            <span className="tabular-nums text-emerald-100/90">{economicsPrice}</span>
          </p>
          <p className="mt-1 text-[0.65rem] text-neutral-500">
            {imperial ? t("formulaEconomicsPerUsGal") : t("formulaEconomicsPerLiter")}
            {" · "}
            {t("formulaEconomicsRefBatch", {
              vol: imperial ? volFmt.format(refGal) : volFmt.format(refLiters),
              unit: imperial ? t("formulaUnitGal") : t("formulaUnitLiter"),
            })}
          </p>
          <p className="mt-1 text-[0.6rem] text-neutral-600">{t("formulaEconomicsFxDisclaimer")}</p>
        </div>

        <dl className="flex min-h-0 flex-1 flex-col gap-4 text-sm leading-relaxed">
          <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-amber-200/75">{t("formulaRawMaterials")}</dt>
            <dd className="mt-2 max-h-36 overflow-y-auto pr-1 text-neutral-300/95 [scrollbar-width:thin]">{raw}</dd>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-amber-200/75">{t("formulaPreparation")}</dt>
            <dd className="mt-2 max-h-36 overflow-y-auto pr-1 text-neutral-300/95 [scrollbar-width:thin]">{prep}</dd>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">{t("formulaDilution")}</dt>
            <dd className="mt-2 text-neutral-300/95">{dil}</dd>
          </div>
          {equiv ? (
            <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-violet-200/80">{t("formulaChemicalEquivalence")}</dt>
              <dd className="mt-2 text-neutral-300/95">{equiv}</dd>
            </div>
          ) : null}
          {dossier ? (
            <div className="rounded-2xl border border-sky-400/18 bg-sky-500/[0.07] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-sky-200/85">{t("formulaTechnicalDossier")}</dt>
              <dd className="mt-2 max-h-40 overflow-y-auto pr-1 text-sm text-neutral-300/95 [scrollbar-width:thin]">
                {convertMetricPhrasesInText(dossier, locale)}
              </dd>
            </div>
          ) : null}
          {hardware ? (
            <div className="rounded-2xl border border-teal-400/18 bg-teal-500/[0.06] px-4 py-3 font-mono text-[0.7rem] leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
              <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-teal-200/85">{t("formulaHardwareIntegration")}</dt>
              <dd className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap pr-1 text-neutral-300/95 [scrollbar-width:thin]">{hardware}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
