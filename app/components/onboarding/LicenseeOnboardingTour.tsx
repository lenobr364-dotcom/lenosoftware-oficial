"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cv_licensee_onboarding_v1";

export function LicenseeOnboardingTour() {
  const pathname = usePathname() ?? "";
  const t = useTranslations("Dashboard");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const isDashboardHome = useMemo(() => {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }, [pathname]);

  useEffect(() => {
    if (!isDashboardHome || typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "done") return;
    } catch {
      return;
    }
    const tmr = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(tmr);
  }, [isDashboardHome]);

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (!open) return null;

  const steps = [
    { title: t("onboardingStep1Title"), body: t("onboardingStep1Body"), action: null as string | null },
    { title: t("onboardingStep2Title"), body: t("onboardingStep2Body"), action: "cv-tour-formula-catalog" },
    { title: t("onboardingStep3Title"), body: t("onboardingStep3Body"), action: "cv-tour-datasheet-btn" },
    { title: t("onboardingStep4Title"), body: t("onboardingStep4Body"), action: null },
  ];
  const s = steps[step] ?? steps[0]!;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cv-tour-title">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close overlay" onClick={finish} />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-400/25 bg-[#0a0c12]/95 p-6 shadow-[0_0_60px_rgba(34,211,238,0.15)] backdrop-blur-2xl">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">ChemVault · Leno & Lumen</p>
        <h2 id="cv-tour-title" className="mt-2 text-xl font-semibold text-white">
          {s.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">{s.body}</p>
        {step === 3 && (
          <p className="mt-4">
            <Link
              href="/dashboard/certifications"
              className="text-sm font-semibold text-cyan-300 underline-offset-4 hover:text-cyan-200 hover:underline"
            >
              {t("sidebarNavCertifications")}
            </Link>
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-xl border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 transition hover:border-white/20 hover:text-white"
            onClick={() => (step > 0 ? setStep(step - 1) : finish())}
          >
            {step === 0 ? t("onboardingSkip") : t("onboardingBack")}
          </button>
          <div className="flex flex-wrap gap-2">
            {s.action && (
              <button
                type="button"
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-100"
                onClick={() => scrollTo(s.action!)}
              >
                {t("onboardingNext")}
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-100"
                onClick={() => setStep((v) => Math.min(v + 1, steps.length - 1))}
              >
                {t("onboardingNext")}
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl border border-amber-400/35 bg-amber-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-100"
                onClick={finish}
              >
                {t("onboardingDone")}
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[0.65rem] text-neutral-600">
          {step + 1} / {steps.length}
        </p>
      </div>
    </div>
  );
}
