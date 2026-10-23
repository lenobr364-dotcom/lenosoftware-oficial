"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";

import { GlassSkeletonLine } from "@/app/components/skeletons/glass-skeleton";
import { defaultCurrencyForUiLocale } from "@/lib/currency-code";

import { getCorporateEmailReject } from "@/lib/is-corporate-email";
import { glassPanelDense } from "@/lib/ui-glass";

const glassPanel = [
  "relative overflow-hidden rounded-[2rem] border border-white/[0.1]",
  "bg-[linear-gradient(165deg,rgba(14,14,18,0.65)_0%,rgba(8,8,12,0.72)_50%,rgba(12,12,16,0.78)_100%)]",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_48px_-24px_rgba(0,0,0,0.55)]",
  "backdrop-blur-[28px] backdrop-saturate-[1.25]",
  "md:p-8",
].join(" ");

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-md transition placeholder:text-neutral-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15";

const inputErrorRing = "border-rose-400/45 ring-2 ring-rose-400/15";

const confirmPanel = [
  glassPanel,
  "flex flex-col items-center text-center",
  "border-cyan-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_48px_-12px_rgba(34,211,238,0.12)]",
].join(" ");

type FieldError = "company" | "country" | "email" | null;

export function BijuLicenseRequestForm() {
  const t = useTranslations("BijuLanding");
  const locale = useLocale();
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldError, setFieldError] = useState<FieldError>(null);

  function clearFieldError() {
    setFieldError(null);
    if (status === "error") setStatus("idle");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const c = company.trim();
    const co = country.trim();
    const em = email.trim();

    if (!c) {
      setFieldError("company");
      toast.error(t("license.toastRequired"));
      return;
    }
    if (!co) {
      setFieldError("country");
      toast.error(t("license.toastRequired"));
      return;
    }
    if (!em) {
      setFieldError("email");
      toast.error(t("license.toastRequired"));
      return;
    }

    const reject = getCorporateEmailReject(em);
    if (reject === "invalid_email") {
      setFieldError("email");
      toast.error(t("license.toastInvalidEmail"));
      return;
    }
    if (reject === "consumer_email") {
      setFieldError("email");
      toast.error(t("license.toastCorporateEmail"));
      return;
    }

    setFieldError(null);
    setStatus("loading");
    try {
      const response = await fetch("/api/request-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: c,
          country: co,
          corporateEmail: em,
          uiLocale: locale,
          currencyCode: defaultCurrencyForUiLocale(locale),
        }),
      });

      let body: { code?: string; error?: string } = {};
      try {
        body = (await response.json()) as { code?: string; error?: string };
      } catch {
        body = {};
      }

      if (!response.ok) {
        setStatus("error");
        const code = body.code ?? body.error;
        if (code === "invalid_email") {
          setFieldError("email");
          toast.error(t("license.toastInvalidEmail"));
        } else if (code === "consumer_email") {
          setFieldError("email");
          toast.error(t("license.toastCorporateEmail"));
        } else if (code === "missing_fields") {
          toast.error(t("license.toastRequired"));
        } else {
          toast.error(t("license.toastError"));
        }
        return;
      }

      toast.success(t("license.toastSuccess"));
      setStatus("success");
    } catch {
      setStatus("error");
      toast.error(t("license.toastError"));
    }
  }

  const submitGlow = [
    "relative inline-flex min-h-[3rem] w-full items-center justify-center overflow-hidden rounded-2xl sm:w-auto sm:min-w-[14rem]",
    "px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black",
    "bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300",
    "shadow-[0_0_24px_-6px_rgba(34,211,238,0.35)]",
    "transition duration-300 ease-out",
    "before:pointer-events-none before:absolute before:inset-0 before:translate-x-[-120%] before:skew-x-[-18deg] before:bg-gradient-to-r before:from-transparent before:via-white/45 before:to-transparent before:opacity-0 before:transition before:duration-500",
    "hover:before:translate-x-[120%] hover:before:opacity-100",
    "hover:shadow-[0_0_40px_-4px_rgba(34,211,238,0.55),0_0_72px_-12px_rgba(167,139,250,0.22)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020308]",
    "disabled:cursor-not-allowed disabled:opacity-60",
  ].join(" ");

  if (status === "success") {
    return (
      <section className="relative mx-auto mt-20 max-w-3xl md:mt-28" aria-labelledby="license-request-heading">
        <div className="text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/65">{t("license.eyebrow")}</p>
          <h2 id="license-request-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {t("license.title")}
          </h2>
        </div>

        <div className={`${confirmPanel} mt-10 py-14 md:py-16`} role="status" aria-live="polite">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-500/10 shadow-[0_0_32px_rgba(34,211,238,0.25)]"
            aria-hidden
          >
            <svg className="h-8 w-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-8 text-xl font-semibold tracking-tight text-white md:text-2xl">{t("license.confirmTitle")}</h3>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-neutral-400 md:text-base">{t("license.confirmBody")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto mt-20 max-w-3xl md:mt-28" aria-labelledby="license-request-heading">
      <div className="text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/65">{t("license.eyebrow")}</p>
        <h2 id="license-request-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {t("license.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-neutral-500 md:text-base">{t("license.lead")}</p>
      </div>

      <form className={`relative ${glassPanel} mt-10`} onSubmit={onSubmit} noValidate>
        {status === "loading" ? (
          <div
            className={`absolute inset-0 z-10 flex flex-col justify-center gap-4 rounded-[2rem] p-8 ${glassPanelDense} backdrop-blur-xl`}
            aria-busy="true"
            aria-label={t("license.submitting")}
          >
            <GlassSkeletonLine className="h-10 w-full" />
            <GlassSkeletonLine className="h-10 w-full sm:col-span-2" />
            <GlassSkeletonLine className="h-10 w-full" />
            <GlassSkeletonLine className="h-10 w-[88%]" />
            <GlassSkeletonLine className="h-12 w-48 rounded-2xl" />
          </div>
        ) : null}
        <div className={status === "loading" ? "pointer-events-none opacity-30" : ""}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400" htmlFor="biju-license-company">
              {t("license.company")}
            </label>
            <input
              id="biju-license-company"
              className={`${inputClass} ${fieldError === "company" ? inputErrorRing : ""}`}
              autoComplete="organization"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                clearFieldError();
              }}
              aria-invalid={fieldError === "company"}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400" htmlFor="biju-license-country">
              {t("license.country")}
            </label>
            <input
              id="biju-license-country"
              className={`${inputClass} ${fieldError === "country" ? inputErrorRing : ""}`}
              autoComplete="country-name"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                clearFieldError();
              }}
              aria-invalid={fieldError === "country"}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400" htmlFor="biju-license-email">
              {t("license.email")}
            </label>
            <input
              id="biju-license-email"
              className={`${inputClass} ${fieldError === "email" ? inputErrorRing : ""}`}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError();
              }}
              aria-invalid={fieldError === "email"}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" className={submitGlow} disabled={status === "loading"} aria-busy={status === "loading"}>
            {status === "loading" ? t("license.submitting") : t("license.submit")}
          </button>
          {status === "error" && <p className="text-sm text-rose-300/95">{t("license.error")}</p>}
        </div>
        </div>
      </form>
    </section>
  );
}
