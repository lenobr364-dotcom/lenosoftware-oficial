"use client";

import type { ProductLine } from "@/lib/product-line";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export type LandingFormulaSummary = {
  id: string;
  title: string;
  productLine: ProductLine;
  rawMaterials: string;
  preparationMethod: string;
  /** When true, high-value international formulas stay masked until terms are accepted. */
  locked?: boolean;
};

type Props = {
  formula: LandingFormulaSummary;
};

function productLineKey(
  line: ProductLine,
): "formulas.productLineAutomotive" | "formulas.productLineBarSoap" | "formulas.productLineGeneralCleaning" {
  switch (line) {
    case "AUTOMOTIVE":
      return "formulas.productLineAutomotive";
    case "BAR_SOAP":
      return "formulas.productLineBarSoap";
    case "GENERAL_CLEANING":
      return "formulas.productLineGeneralCleaning";
  }
}

export function LandingFormulaSummaryCard({ formula }: Props) {
  const t = useTranslations("Landing");
  const locked = formula.locked === true;

  const panelClass =
    "rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

  const labelClass = "text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-white/40";

  const bodyClass =
    "mt-2 max-h-[11.5rem] overflow-y-auto text-[0.8125rem] leading-[1.65] text-neutral-300/95 [scrollbar-width:thin]";

  return (
    <article
      className={[
        "group relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] p-6 sm:p-7",
        "border border-white/[0.08]",
        "bg-[linear-gradient(165deg,rgba(12,12,14,0.72)_0%,rgba(6,6,8,0.78)_48%,rgba(10,10,12,0.82)_100%)]",
        "backdrop-blur-[36px] backdrop-saturate-[1.35]",
        "shadow-[0_2px_4px_rgba(0,0,0,0.35),0_20px_48px_-24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_0_0_0.5px_rgba(255,255,255,0.04)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-0.5 hover:border-white/[0.12]",
        "hover:shadow-[0_4px_8px_rgba(0,0,0,0.4),0_28px_56px_-20px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_0.5px_rgba(255,255,255,0.07)]",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_95%_65%_at_50%_-15%,rgba(255,220,150,0.07),transparent_52%)]"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
        <h3 className="text-pretty text-xl font-semibold leading-[1.2] tracking-[-0.02em] text-white sm:text-2xl">
          {formula.title}
        </h3>

        <span className="w-fit rounded-full border border-amber-200/20 bg-gradient-to-r from-amber-500/[0.12] to-white/[0.04] px-3.5 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-amber-50/95 shadow-[0_0_20px_-4px_rgba(251,191,36,0.25)] backdrop-blur-md">
          {t(productLineKey(formula.productLine))}
        </span>

        <dl className="mt-1 flex min-h-0 flex-1 flex-col gap-3">
          {locked ? (
            <div
              className={[
                panelClass,
                "border-amber-400/15 bg-gradient-to-br from-amber-500/[0.08] to-transparent",
              ].join(" ")}
            >
              <dt className={labelClass}>{t("formulas.intlLicenseLockedEyebrow")}</dt>
              <dd className="mt-3 space-y-3 text-[0.8125rem] leading-relaxed text-amber-50/90">
                <p className="font-medium text-white/90">{t("formulas.intlLicenseLockedTitle")}</p>
                <p className="text-neutral-300/90">{t("formulas.intlLicenseLockedBody")}</p>
                <Link
                  href="/licensing-terms"
                  className="inline-flex w-fit rounded-full border border-cyan-400/35 bg-cyan-500/15 px-4 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/25"
                >
                  {t("formulas.intlLicenseCta")}
                </Link>
              </dd>
            </div>
          ) : (
            <>
              <div className={panelClass}>
                <dt className={labelClass}>{t("formulas.materialsLabel")}</dt>
                <dd className={bodyClass}>{formula.rawMaterials}</dd>
              </div>
              <div className={panelClass}>
                <dt className={labelClass}>{t("formulas.preparationLabel")}</dt>
                <dd className={bodyClass}>{formula.preparationMethod}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </article>
  );
}
