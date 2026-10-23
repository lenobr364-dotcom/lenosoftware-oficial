"use client";

import { recordInternationalLicensingAcceptance } from "./actions";
import { INITIAL_ACCEPT_INTL_TERMS_STATE, type AcceptIntlTermsState } from "./accept-state";
import { Link } from "@/i18n/navigation";
import type { IntlLegalLang } from "@/lib/international-licensing-terms";
import { getInternationalTermsBlock, INTERNATIONAL_TERMS_VERSION } from "@/lib/international-licensing-terms";
import { useTranslations } from "next-intl";
import { useActionState, useMemo, useState } from "react";

type Props = {
  initialLegalLang: IntlLegalLang;
  alreadyAccepted: boolean;
};

export function InternationalLicensingTermsClient({ initialLegalLang, alreadyAccepted }: Props) {
  const t = useTranslations("InternationalLicense");
  const [viewLang, setViewLang] = useState<IntlLegalLang>(initialLegalLang);
  const [state, formAction, pending] = useActionState<AcceptIntlTermsState, FormData>(
    recordInternationalLicensingAcceptance,
    INITIAL_ACCEPT_INTL_TERMS_STATE,
  );

  const block = useMemo(() => getInternationalTermsBlock(viewLang), [viewLang]);

  const glassPanel =
    "rounded-[1.75rem] border border-white/[0.12] bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-transparent shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150";

  const tabBase =
    "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200";
  const tabActive = "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/35";
  const tabIdle = "text-white/45 hover:bg-white/[0.06] hover:text-white/75";

  const pdfHref =
    state.ok && state.transactionCode
      ? `/api/licensing/intl-certificate/${encodeURIComponent(state.transactionCode)}`
      : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] px-5 py-14 text-white sm:px-8 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(34,211,238,0.14),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(251,191,36,0.06),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_28%,transparent_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className={`${glassPanel} px-6 py-8 sm:px-10 sm:py-10`}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">{t("eyebrow")}</p>
          <h1 className="mt-3 text-pretty text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[2rem]">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/70">{t("subtitle")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-6">
            <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-100/95">
              {t("ipBadge")}
            </span>
            <span className="text-xs text-white/50">
              {t("versionLabel")}: <span className="font-mono text-cyan-200/90">{INTERNATIONAL_TERMS_VERSION}</span>
            </span>
          </div>
        </header>

        {alreadyAccepted && !state.ok ? (
          <div className={`${glassPanel} mt-8 px-6 py-5 sm:px-8`}>
            <p className="text-sm font-medium text-emerald-200/95">{t("alreadyAcceptedTitle")}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">{t("alreadyAcceptedBody")}</p>
          </div>
        ) : null}

        <section className={`${glassPanel} mt-8 px-5 py-6 sm:px-8 sm:py-8`}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/40">{t("contractLanguage")}</p>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={t("contractLanguage")}>
            {(["pt", "en", "es"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={viewLang === lang}
                className={`${tabBase} ${viewLang === lang ? tabActive : tabIdle}`}
                onClick={() => setViewLang(lang)}
              >
                {lang === "pt" ? t("langPt") : lang === "en" ? t("langEn") : t("langEs")}
              </button>
            ))}
          </div>

          <article className="mt-8 max-h-[min(52vh,28rem)] overflow-y-auto pr-1 [scrollbar-width:thin]">
            <h2 className="text-lg font-semibold text-white">{block.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-cyan-100/85 [text-wrap:pretty]">{block.ipLine}</p>
            <ol className="mt-6 space-y-5 border-t border-white/[0.06] pt-6">
              {block.sections.map((sec) => (
                <li key={sec.heading}>
                  <h3 className="text-sm font-semibold text-white/90">{sec.heading}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65 [text-wrap:pretty]">{sec.body}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className={`${glassPanel} mt-8 px-5 py-6 sm:px-8 sm:py-8`}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">{t("acceptSectionTitle")}</h2>
          <form action={formAction} className="mt-6 space-y-6">
            <input type="hidden" name="legalLang" value={viewLang} />

            <div>
              <label htmlFor="signerEmail" className="text-xs font-medium text-white/55">
                {t("emailLabel")}
              </label>
              <input
                id="signerEmail"
                name="signerEmail"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                className="mt-2 w-full rounded-xl border border-white/[0.12] bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none ring-cyan-400/30 transition-[border-color,box-shadow] focus:border-cyan-400/40 focus:ring-2"
              />
              <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-white/40">{t("emailHint")}</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-4 transition-colors hover:border-white/[0.12]">
              <input
                type="checkbox"
                name="agreed"
                className="mt-1 h-4 w-4 shrink-0 rounded border-white/25 bg-black/40 text-cyan-500 focus:ring-cyan-400/50"
              />
              <span className="text-sm leading-relaxed text-white/75">{t("agreeLabel")}</span>
            </label>

            {state.error === "must_agree" ? (
              <p className="text-sm text-amber-200/90" role="alert">
                {t("errorMustAgree")}
              </p>
            ) : null}
            {state.error === "server" ? (
              <p className="text-sm text-red-300/90" role="alert">
                {t("errorServer")}
              </p>
            ) : null}

            {state.ok && state.transactionCode ? (
              <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-4">
                <p className="text-sm font-medium text-emerald-100">{t("successTitle")}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{t("successBody")}</p>
                <p className="mt-3 font-mono text-sm text-cyan-200/95">
                  {t("transactionLabel")}: {state.transactionCode}
                </p>
                {pdfHref ? (
                  <a
                    href={pdfHref}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/90 to-teal-600/90 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110"
                  >
                    {t("downloadPdf")}
                  </a>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-white/[0.12] px-5 py-3.5 text-sm font-semibold text-white ring-1 ring-white/15 transition enabled:hover:bg-white/[0.18] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
            >
              {pending ? t("submitting") : t("submit")}
            </button>
          </form>
        </section>

        <p className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
          >
            {t("backLanding")}
          </Link>
        </p>
      </div>
    </main>
  );
}
