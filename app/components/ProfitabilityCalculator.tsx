"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  COMMERCIAL_ASSET_KEYS,
  COMMERCIAL_ASSET_REFERENCE,
  type CommercialAssetKey,
} from "@/lib/commercial-assets";

/** BRL per 1 USD — illustrative spot rate for the panel (not a live FX feed). */
const SIMULATED_BRL_PER_USD = 5.45;

function formatAmountForInput(amount: number, locale: string): string {
  const tag = locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-US";
  return amount.toLocaleString(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

export function ProfitabilityCalculator() {
  const locale = useLocale();
  const t = useTranslations("Commercial");

  const [hasCalculated, setHasCalculated] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CommercialAssetKey | "">("");
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const assetComboboxRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const [costInput, setCostInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const brl = useMemo(
    () => new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", { style: "currency", currency: "BRL" }),
    [locale],
  );
  const usd = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

  useEffect(() => {
    if (!assetMenuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      const el = assetComboboxRef.current;
      if (el && !el.contains(event.target as Node)) {
        setAssetMenuOpen(false);
        setHighlightedIndex(-1);
      }
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setAssetMenuOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [assetMenuOpen]);

  useEffect(() => {
    if (assetMenuOpen) {
      window.setTimeout(() => listboxRef.current?.focus(), 0);
    }
  }, [assetMenuOpen]);

  const canCalculate = selectedAsset !== "";

  const metrics = useMemo(() => {
    const costBrl = parseBrlInput(costInput);
    const priceBrl = parseBrlInput(priceInput);
    const grossProfitBrl = priceBrl - costBrl;
    const marginPercent = priceBrl > 0 ? (grossProfitBrl / priceBrl) * 100 : null;
    const rate = SIMULATED_BRL_PER_USD;
    const grossProfitUsd = grossProfitBrl / rate;
    const costUsd = costBrl / rate;
    const priceUsd = priceBrl / rate;
    return {
      costBrl,
      priceBrl,
      grossProfitBrl,
      marginPercent,
      grossProfitUsd,
      costUsd,
      priceUsd,
      hasInputs: costInput.trim() !== "" || priceInput.trim() !== "",
    };
  }, [costInput, priceInput]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCalculate) return;
    setHasCalculated(true);
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-amber-200/85 focus:ring-2 focus:ring-amber-200/22";

  const selectTriggerClass = [
    "flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left outline-none transition",
    "text-neutral-100 hover:border-white/[0.14]",
    "focus-visible:border-amber-200/85 focus-visible:ring-2 focus-visible:ring-amber-200/22",
    assetMenuOpen ? "border-amber-200/75 ring-2 ring-amber-200/25" : "",
  ].join(" ");

  const listboxPanelClass = [
    "absolute left-0 right-0 top-full z-40 mt-2 max-h-[min(16rem,calc(100vh-12rem))] overflow-y-auto overflow-x-hidden rounded-2xl py-2",
    "border border-white/[0.12] bg-neutral-950/90 backdrop-blur-2xl backdrop-saturate-150",
    "shadow-[0_20px_50px_-14px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.07)]",
    "animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out",
  ].join(" ");

  function selectAsset(key: CommercialAssetKey) {
    setSelectedAsset(key);
    const ref = COMMERCIAL_ASSET_REFERENCE[key];
    setCostInput(formatAmountForInput(ref.baseCost, locale));
    setPriceInput(formatAmountForInput(ref.suggestedPrice, locale));
    setHasCalculated(false);
    setAssetMenuOpen(false);
    setHighlightedIndex(-1);
  }

  function handleAssetTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setAssetMenuOpen(true);
      setHighlightedIndex(0);
    }
  }

  function handleListboxKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    if (!assetMenuOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % COMMERCIAL_ASSET_KEYS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? COMMERCIAL_ASSET_KEYS.length - 1 : i - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(COMMERCIAL_ASSET_KEYS.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < COMMERCIAL_ASSET_KEYS.length) {
        selectAsset(COMMERCIAL_ASSET_KEYS[highlightedIndex]!);
      }
    }
  }

  const selectedAssetLabel = selectedAsset ? t(`assetNames.${selectedAsset}`) : "";

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-[0_0_40px_rgba(255,215,0,0.12)] backdrop-blur-xl">
      <div className="mx-auto max-w-3xl space-y-5 md:space-y-6">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65 sm:text-xs sm:tracking-[0.34em]">
          {t("profitability.eyebrow")}
        </p>
        <div className="space-y-4 md:space-y-[1.125rem]">
          <h2
            className={[
              "text-pretty text-3xl font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[2.125rem] sm:leading-[1.1] sm:tracking-[-0.026em] md:text-4xl md:tracking-[-0.03em]",
              "bg-gradient-to-br from-white via-[#f4f1ea] to-[#d9c9a8] bg-clip-text text-transparent",
              "[filter:drop-shadow(0_0_28px_rgba(212,175,55,0.11))_drop-shadow(0_1px_0_rgba(255,255,255,0.12))]",
            ].join(" ")}
          >
            {t("profitability.title")}
          </h2>
          <p className="max-w-2xl text-pretty text-[0.9375rem] font-normal leading-[1.72] tracking-[0.012em] text-neutral-400/78 antialiased md:text-base md:leading-[1.74] md:tracking-[0.01em] md:text-neutral-400/82">
            {t("profitability.intro")}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <div
          className={[
            "relative isolate overflow-hidden rounded-[2rem] p-6 sm:p-8",
            "border border-white/[0.14]",
            "bg-gradient-to-br from-white/[0.14] via-white/[0.05] to-black/25",
            "backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.12),0_12px_40px_-16px_rgba(0,0,0,0.5)]",
          ].join(" ")}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-[0.35] bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(255,236,180,0.12),transparent_55%)]"
          />

          <form
            className={[
              "relative z-10 grid gap-8 lg:gap-10",
              hasCalculated ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" : "lg:grid-cols-1",
            ].join(" ")}
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-5">
              <div ref={assetComboboxRef} className="relative">
                <span className="mb-2 block text-sm tracking-[0.01em] text-neutral-300/95" id={`${listboxId}-label`}>
                  {t("profitability.labelSelectAsset")}
                </span>
                <button
                  type="button"
                  className={selectTriggerClass}
                  aria-haspopup="listbox"
                  aria-expanded={assetMenuOpen}
                  aria-controls={listboxId}
                  aria-labelledby={`${listboxId}-label`}
                  onClick={() => {
                    if (assetMenuOpen) {
                      setAssetMenuOpen(false);
                      setHighlightedIndex(-1);
                    } else {
                      setAssetMenuOpen(true);
                      const idx = selectedAsset ? COMMERCIAL_ASSET_KEYS.indexOf(selectedAsset) : -1;
                      setHighlightedIndex(idx >= 0 ? idx : 0);
                    }
                  }}
                  onKeyDown={handleAssetTriggerKeyDown}
                >
                  <span className={selectedAsset ? "font-medium text-white" : "text-neutral-500"}>
                    {selectedAsset ? selectedAssetLabel : t("profitability.placeholderFormula")}
                  </span>
                  <svg
                    aria-hidden
                    className={["h-5 w-5 shrink-0 text-amber-200/70 transition-transform duration-200", assetMenuOpen ? "rotate-180" : ""].join(" ")}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {assetMenuOpen && (
                  <ul
                    ref={listboxRef}
                    id={listboxId}
                    role="listbox"
                    tabIndex={0}
                    aria-labelledby={`${listboxId}-label`}
                    className={listboxPanelClass}
                    onKeyDown={handleListboxKeyDown}
                  >
                    {COMMERCIAL_ASSET_KEYS.map((key, index) => {
                      const isSelected = key === selectedAsset;
                      const isHighlighted = index === highlightedIndex;
                      return (
                        <li key={key} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={[
                              "flex w-full px-4 py-2.5 text-left text-sm tracking-[0.01em] transition",
                              "text-neutral-200 hover:bg-white/[0.08] hover:text-amber-50/95",
                              isHighlighted ? "bg-white/[0.1] text-amber-50" : "",
                              isSelected ? "font-medium text-amber-100/90" : "",
                            ].join(" ")}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectAsset(key)}
                          >
                            {t(`assetNames.${key}`)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <label className="flex flex-col gap-2 text-sm tracking-[0.01em] text-neutral-300/95">
                {t("profitability.labelCost")}
                <input
                  className={inputClass}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={t("profitability.placeholderAmount")}
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm tracking-[0.01em] text-neutral-300/95">
                {t("profitability.labelPrice")}
                <input
                  className={inputClass}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={t("profitability.placeholderAmount")}
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={!canCalculate}
                className={[
                  "mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-lg shadow-amber-500/25 transition sm:w-auto sm:self-start",
                  canCalculate ? "hover:brightness-110" : "cursor-not-allowed opacity-50",
                ].join(" ")}
              >
                {t("profitability.submitCalculate")}
              </button>
              <p className="text-xs leading-relaxed tracking-[0.02em] text-neutral-500/90">
                {t("profitability.fxDisclaimer", { rate: brl.format(SIMULATED_BRL_PER_USD) })}
              </p>
            </div>

            {hasCalculated && selectedAsset ? (
              <div
                className={[
                  "flex flex-col gap-4 rounded-2xl border border-white/[0.1] bg-black/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-6",
                  "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out",
                  "motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
                ].join(" ")}
              >
                <div className="space-y-1">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-amber-200/60">{t("profitability.resultsEyebrow")}</p>
                  <p className="text-xs leading-relaxed tracking-[0.02em] text-neutral-400/90">
                    {t("profitability.assetLine", { name: selectedAssetLabel })}
                  </p>
                </div>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-xs tracking-[0.08em] text-neutral-500">{t("profitability.metricMargin")}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-white">
                      {metrics.marginPercent === null ? "—" : `${metrics.marginPercent.toFixed(1)}%`}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <dt className="text-xs tracking-[0.08em] text-neutral-500">{t("profitability.metricGrossBrl")}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-amber-100/95">
                      {brl.format(metrics.grossProfitBrl)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    <dt className="text-xs tracking-[0.08em] text-neutral-500">{t("profitability.metricGrossUsd")}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-neutral-100">
                      {usd.format(metrics.grossProfitUsd)}
                    </dd>
                  </div>
                </dl>

                <div className="relative mt-6 w-full sm:mx-auto sm:max-w-lg">
                  <span
                    aria-hidden
                    className="absolute inset-[-6px] rounded-[1.25rem] bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 opacity-90 blur-lg motion-safe:animate-pulse"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-[-2px] rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 opacity-55 blur-[2px]"
                  />
                  <Link
                    href={`/acesso?asset=${encodeURIComponent(selectedAsset)}`}
                    className={[
                      "relative flex w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-4 text-center",
                      "border-2 border-amber-100/60 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-600",
                      "text-base font-bold uppercase tracking-[0.18em] text-neutral-950 sm:text-lg sm:tracking-[0.2em]",
                      "shadow-[0_0_40px_rgba(251,191,36,0.65),0_0_88px_rgba(217,119,6,0.32),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(180,83,9,0.25)]",
                      "transition duration-200 hover:brightness-110 hover:shadow-[0_0_56px_rgba(251,191,36,0.78),0_0_100px_rgba(245,158,11,0.38)] active:scale-[0.99]",
                      "motion-reduce:shadow-[0_0_32px_rgba(251,191,36,0.5)]",
                    ].join(" ")}
                  >
                    <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">{t("profitability.ctaGlobalLicense")}</span>
                  </Link>
                </div>

                <div className="border-t border-white/10 pt-4 text-xs leading-relaxed tracking-[0.01em] text-neutral-400/85">
                  <p>
                    {t("profitability.footerCostPrice", { cost: brl.format(metrics.costBrl), price: brl.format(metrics.priceBrl) })}
                  </p>
                  <p className="mt-2 text-neutral-500/95">
                    {t("profitability.footerUsdRef", { costUsd: usd.format(metrics.costUsd), priceUsd: usd.format(metrics.priceUsd) })}
                  </p>
                  {!metrics.hasInputs ? <p className="mt-3 text-amber-200/55">{t("profitability.footerBlankHint")}</p> : null}
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
