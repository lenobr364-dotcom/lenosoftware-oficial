"use client";

import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { isCommercialAssetKey } from "@/lib/commercial-assets";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function decodeAssetParam(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

function PortalLoadingFallback() {
  const t = useTranslations("Commercial.licensePortal");
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-sm tracking-wide text-neutral-500">
      {t("loading")}
    </main>
  );
}

function ExclusiveApplicationPortal() {
  const t = useTranslations("Commercial");
  const tl = useTranslations("Commercial.licensePortal");
  const searchParams = useSearchParams();
  const rawAsset = decodeAssetParam(searchParams.get("asset"));
  const assetParam = useMemo(() => (rawAsset ?? "").trim(), [rawAsset]);
  const assetDisplay =
    rawAsset && isCommercialAssetKey(rawAsset) ? t(`assetNames.${rawAsset}`) : rawAsset ?? null;

  const [contactName, setContactName] = useState("");
  const [corporationName, setCorporationName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [monthlyCapacity, setMonthlyCapacity] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3.5 text-white outline-none transition placeholder:text-neutral-600 focus:border-amber-200/80 focus:ring-2 focus:ring-amber-500";

  const labelClass = "flex flex-col gap-2 text-sm font-medium tracking-[0.01em] text-neutral-300/95";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsLoading(true);
    try {
      const meta: string[] = [];
      const assetLabel = (assetDisplay ?? assetParam ?? "").trim();
      if (assetLabel) meta.push(`${tl("metaAsset")}: ${assetLabel}`);
      if (monthlyCapacity.trim()) meta.push(`${tl("metaCapacity")}: ${monthlyCapacity.trim()}`);
      const baseCorp = corporationName.trim();
      const withContact = contactName.trim() ? `${contactName.trim()} — ${baseCorp}` : baseCorp;
      const companyStored = meta.length > 0 ? `${withContact} (${meta.join(" · ")})` : withContact;

      const response = await fetch("/api/request-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          company: companyStored,
          country: country.trim(),
          corporateEmail: email.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setSubmitError(typeof data?.error === "string" ? data.error : tl("submitError"));
        return;
      }

      if (response.status === 200) {
        setIsSubmitted(true);
      } else {
        setSubmitError(tl("submitError"));
      }
    } catch {
      setSubmitError(tl("submitError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-12 text-white md:px-12 md:py-16">
      <ChemVaultPageBackdrop tone="gate" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65 sm:text-xs sm:tracking-[0.34em]">
            {tl("eyebrow")}
          </p>
          <h1
            className={[
              "mt-5 text-pretty text-3xl font-semibold leading-[1.12] tracking-[-0.022em] sm:text-4xl sm:tracking-[-0.026em]",
              "bg-gradient-to-br from-white via-[#f4f1ea] to-[#d9c9a8] bg-clip-text text-transparent",
              "[filter:drop-shadow(0_0_28px_rgba(212,175,55,0.12))_drop-shadow(0_1px_0_rgba(255,255,255,0.12))]",
            ].join(" ")}
          >
            {tl("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-[0.9375rem] leading-[1.72] tracking-[0.012em] text-neutral-400/80 antialiased md:text-base md:leading-[1.74] md:tracking-[0.01em]">
            {tl("intro")}
          </p>
        </header>

        <div
          className={[
            "relative min-h-[28rem] rounded-[2rem] border border-white/[0.12] p-8 sm:min-h-[30rem] sm:p-10",
            "bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-black/30",
            "backdrop-blur-2xl backdrop-saturate-150",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.15),0_20px_50px_-20px_rgba(0,0,0,0.55)]",
          ].join(" ")}
        >
          {!isSubmitted ? (
            <>
              {assetDisplay ? (
                <div
                  className={[
                    "mb-8 rounded-2xl border border-amber-200/35 px-5 py-4 text-center sm:px-6",
                    "bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-yellow-500/10",
                    "backdrop-blur-md",
                    "shadow-[0_0_32px_rgba(212,175,55,0.22),inset_0_1px_0_rgba(255,248,220,0.18)]",
                  ].join(" ")}
                >
                  <p className="text-sm font-semibold leading-snug tracking-[0.04em] text-amber-50/95 sm:text-[0.9375rem]">
                    {tl("licenseBadge", { asset: assetDisplay })}
                  </p>
                </div>
              ) : null}

              <form className="flex flex-col gap-6 sm:gap-7" onSubmit={handleSubmit}>
                <label className={labelClass}>
                  {tl("fieldContactName")}
                  <input
                    className={inputClass}
                    name="contactName"
                    autoComplete="name"
                    placeholder={tl("placeholderContactName")}
                    value={contactName}
                    disabled={isLoading}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  {tl("fieldCorporation")}
                  <input
                    className={inputClass}
                    name="corporationName"
                    autoComplete="organization"
                    placeholder={tl("placeholderCorporation")}
                    value={corporationName}
                    disabled={isLoading}
                    onChange={(e) => setCorporationName(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  {tl("fieldCountry")}
                  <input
                    className={inputClass}
                    name="country"
                    autoComplete="country-name"
                    placeholder={tl("placeholderCountry")}
                    value={country}
                    disabled={isLoading}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  {tl("fieldEmail")}
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={tl("placeholderEmail")}
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  {tl("fieldCapacity")}
                  <input
                    className={inputClass}
                    name="monthlyCapacity"
                    autoComplete="off"
                    placeholder={tl("placeholderCapacity")}
                    value={monthlyCapacity}
                    disabled={isLoading}
                    onChange={(e) => setMonthlyCapacity(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={[
                    "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/30 transition sm:py-3.5",
                    isLoading ? "cursor-wait opacity-90" : "hover:brightness-110 active:scale-[0.99]",
                  ].join(" ")}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-80" aria-hidden />
                      <span>{tl("submitProcessing")}</span>
                    </>
                  ) : (
                    tl("submitLicense")
                  )}
                </button>
                {submitError ? (
                  <p className="text-center text-sm leading-relaxed text-rose-300/95" role="alert">
                    {submitError}
                  </p>
                ) : null}
              </form>
            </>
          ) : (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] bg-black/45 p-4 backdrop-blur-md sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="acesso-success-title"
            >
              <div
                className={[
                  "w-full max-w-md rounded-[1.75rem] border border-amber-200/25 p-8 text-center sm:p-10",
                  "bg-gradient-to-br from-white/[0.14] via-neutral-950/75 to-black/80",
                  "backdrop-blur-xl backdrop-saturate-150",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_64px_-12px_rgba(0,0,0,0.65),0_0_48px_-8px_rgba(212,175,55,0.2)]",
                  "animate-in fade-in zoom-in-95 duration-500 ease-out",
                  "motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:scale-100",
                ].join(" ")}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/10 shadow-[0_0_28px_rgba(251,191,36,0.45)] motion-safe:animate-pulse">
                  <Check className="h-9 w-9 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]" strokeWidth={2.5} aria-hidden />
                </div>
                <h2
                  id="acesso-success-title"
                  className="mt-6 text-pretty text-2xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[1.65rem]"
                >
                  {tl("successTitle")}
                </h2>
                <p className="mt-4 text-pretty text-sm leading-[1.75] tracking-[0.02em] text-neutral-400/95 sm:text-[0.9375rem]">
                  {tl("successBody")}
                </p>
                <Link
                  href="/"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold tracking-[0.08em] text-neutral-100 transition hover:border-amber-200/35 hover:bg-white/[0.1] hover:text-amber-50/95"
                >
                  {tl("backPortfolio")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AcessoPage() {
  return (
    <Suspense fallback={<PortalLoadingFallback />}>
      <ExclusiveApplicationPortal />
    </Suspense>
  );
}
