"use client";

import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { LandingFormulaSummaryCard, type LandingFormulaSummary } from "@/app/components/LandingFormulaSummaryCard";
import { GateValidatingSkeleton, LandingFormulasGridSkeleton } from "@/app/components/skeletons/glass-skeleton";
import { ProfitabilityCalculator } from "@/app/components/ProfitabilityCalculator";
import { useTranslations } from "next-intl";
import { type ReactNode, FormEvent, useEffect, useMemo, useState } from "react";

const PORTFOLIO_CARD_IDS = ["catalysts", "containment", "highPurity", "technicalCoatings"] as const;

type PortfolioCardId = (typeof PORTFOLIO_CARD_IDS)[number];

const PORTFOLIO_ICONS: Record<PortfolioCardId, ReactNode> = {
  catalysts: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l9 5v10l-9 5-9-5V7l9-5Z" />
      <path d="M12 9v6" />
      <path d="M9 14h6" />
    </svg>
  ),
  containment: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16v10H4z" />
      <path d="M9 7v-2" />
      <path d="M15 7v-2" />
    </svg>
  ),
  highPurity: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M6 6l12 12" />
    </svg>
  ),
  technicalCoatings: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h16" />
      <path d="M4 4h16" />
      <path d="M8 4v16" />
      <path d="M16 4v16" />
    </svg>
  ),
};

type Props = {
  formulas?: LandingFormulaSummary[];
};

export function LandingHomeClient({ formulas: initialFormulas = [] }: Props) {
  const tGate = useTranslations("Gate");
  const t = useTranslations("Landing");
  const [key, setKey] = useState("");
  const [formulas, setFormulas] = useState<LandingFormulaSummary[]>(initialFormulas);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultFormulasLoading, setVaultFormulasLoading] = useState(false);
  const [gateExiting, setGateExiting] = useState(false);
  const [status, setStatus] = useState<"idle" | "denied" | "granting">("idle");
  const [feedback, setFeedback] = useState(() => t("gate.feedbackInitial"));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("denied") === "1") {
      window.history.replaceState(null, "", window.location.pathname);
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setFeedback(tGate("accessDenied"));
        setStatus("denied");
      });
      return () => {
        cancelled = true;
      };
    }

    if (params.get("chemvault") !== "1") return;

    let cancelled = false;
    void (async () => {
      setVaultFormulasLoading(true);
      try {
        const r = await fetch("/api/vault/formulas", { credentials: "same-origin" });
        if (cancelled || !r.ok) return;
        const j = (await r.json()) as { formulas?: LandingFormulaSummary[] };
        setFormulas(j.formulas ?? []);
        setVaultUnlocked(true);
      } finally {
        if (!cancelled) setVaultFormulasLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tGate]);

  const canSubmit = useMemo(() => {
    return status !== "granting" && !gateExiting;
  }, [status, gateExiting]);

  async function handleAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const trimmed = key.trim();
    if (!trimmed) {
      setStatus("denied");
      setFeedback(t("gate.feedbackDenied"));
      return;
    }

    setStatus("granting");
    setFeedback(t("gate.feedbackValidating"));
    setVaultFormulasLoading(true);
    try {
      const unlock = await fetch("/api/vault/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ accessKey: trimmed }),
      });
      if (!unlock.ok) {
        setStatus("denied");
        setFeedback(t("gate.feedbackDenied"));
        return;
      }
      const fr = await fetch("/api/vault/formulas", { credentials: "same-origin" });
      if (!fr.ok) {
        setStatus("denied");
        setFeedback(t("gate.feedbackDenied"));
        return;
      }
      const data = (await fr.json()) as { formulas?: LandingFormulaSummary[] };
      setFormulas(data.formulas ?? []);
      setFeedback(t("gate.feedbackAuthorized"));
      setGateExiting(true);
      window.setTimeout(() => {
        setVaultUnlocked(true);
        setGateExiting(false);
        setStatus("idle");
      }, 520);
    } catch {
      setStatus("denied");
      setFeedback(t("gate.feedbackDenied"));
    } finally {
      setVaultFormulasLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone={vaultUnlocked ? "dashboard" : "gate"} />

      {!vaultUnlocked && (
        <div
          className={[
            "fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto px-4 py-10 transition-[opacity,visibility] duration-500 ease-out md:px-8",
            gateExiting ? "pointer-events-none opacity-0" : "opacity-100",
          ].join(" ")}
          aria-modal="true"
          aria-labelledby="vault-gate-title"
          role="dialog"
        >
          <div className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-2xl backdrop-saturate-150 transition-opacity duration-500" />
          <div
            className={[
              "relative z-10 my-auto w-full max-w-5xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              gateExiting ? "translate-y-2 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100",
            ].join(" ")}
          >
            <div className="rounded-[2.5rem] border border-white/[0.12] bg-[linear-gradient(165deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_48%,rgba(2,3,8,0.55)_100%)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_52px_rgba(255,215,0,0.1)] backdrop-blur-[32px] backdrop-saturate-[1.35] sm:p-10">
              <div className="text-center">
                <div className="mx-auto max-w-3xl space-y-5 md:space-y-6">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65 sm:text-xs sm:tracking-[0.34em]">
                    {t("gate.eyebrow")}
                  </p>
                  <div className="space-y-4 md:space-y-[1.125rem]">
                    <h1
                      id="vault-gate-title"
                      className={[
                        "text-pretty text-4xl font-semibold leading-[1.06] tracking-[-0.026em] sm:text-5xl sm:leading-[1.05] sm:tracking-[-0.028em] md:text-6xl md:tracking-[-0.032em] lg:text-[3.75rem] lg:leading-[1.04]",
                        "bg-gradient-to-br from-white via-[#f4f1ea] to-[#d9c9a8] bg-clip-text text-transparent",
                        "[filter:drop-shadow(0_0_42px_rgba(212,175,55,0.14))_drop-shadow(0_0_96px_rgba(212,175,55,0.07))_drop-shadow(0_1px_0_rgba(255,255,255,0.15))]",
                      ].join(" ")}
                    >
                      ChemVault Global
                    </h1>
                    <p className="mx-auto max-w-2xl text-pretty text-[0.9375rem] font-normal leading-[1.72] tracking-[0.012em] text-neutral-400/78 antialiased md:text-base md:leading-[1.74] md:tracking-[0.01em] md:text-neutral-400/82">
                      {t("gate.heroLead")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
                <div className="rounded-[2rem] border border-white/[0.12] bg-black/55 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_rgba(255,215,0,0.1)] backdrop-blur-2xl">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">{t("gate.cryptoTitle")}</h2>
                  <p className="mt-3 text-sm leading-[1.65] tracking-[0.01em] text-neutral-400/82">{t("gate.cryptoLead")}</p>
                  <form className="mt-6 flex flex-col gap-4" onSubmit={handleAccess}>
                    <label className="flex flex-col gap-2 text-sm tracking-[0.01em] text-neutral-300/95">
                      {t("gate.labelAccessKey")}
                      <input
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-amber-200/85 focus:ring-2 focus:ring-amber-200/22"
                        type="password"
                        value={key}
                        autoComplete="off"
                        disabled={!canSubmit}
                        onChange={(event) => setKey(event.target.value)}
                        placeholder="••••••••••••"
                      />
                    </label>
                    <button
                      className={[
                        "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-lg shadow-amber-500/25 transition hover:brightness-110",
                        !canSubmit ? "opacity-70" : "",
                      ].join(" ")}
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {status === "granting" ? t("gate.btnSubmitAuthorized") : t("gate.btnSubmit")}
                    </button>
                  </form>
                  <p
                    className={`mt-4 text-sm leading-relaxed tracking-[0.01em] ${status === "denied" ? "text-rose-300/95" : "text-emerald-300/95"}`}
                  >
                    {feedback}
                  </p>
                  {status === "granting" ? <GateValidatingSkeleton /> : null}
                </div>

                <div className="rounded-[2rem] border border-white/[0.1] bg-white/[0.06] p-8 text-neutral-300/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{t("gate.securityTitle")}</h3>
                  <ul className="mt-5 space-y-3 text-sm leading-[1.65] tracking-[0.01em] text-neutral-400/85">
                    <li>{t("gate.securityBullet1")}</li>
                    <li>{t("gate.securityBullet2")}</li>
                    <li>{t("gate.securityBullet3")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {vaultUnlocked && (
      <section className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <header className="rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_0_40px_rgba(255,215,0,0.1)] backdrop-blur-xl md:p-10">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65">{t("formulas.dashboardEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("formulas.dashboardTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400/85 md:text-base">{t("formulas.dashboardSubtitle")}</p>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_40px_rgba(255,215,0,0.08)] backdrop-blur-xl md:p-10">
          <div className="max-w-3xl space-y-3">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65">{t("formulas.eyebrow")}</p>
            <h3
              className={[
                "text-pretty text-2xl font-semibold tracking-tight sm:text-3xl",
                "bg-gradient-to-br from-white via-[#f4f1ea] to-[#d9c9a8] bg-clip-text text-transparent",
              ].join(" ")}
            >
              {t("formulas.title")}
            </h3>
            <p className="text-pretty text-sm leading-relaxed text-neutral-400/85 md:text-base">{t("formulas.description")}</p>
          </div>

          {vaultFormulasLoading && formulas.length === 0 ? (
            <LandingFormulasGridSkeleton />
          ) : formulas.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-dashed border-white/20 bg-black/30 px-6 py-14 text-center backdrop-blur-md">
              <p className="text-sm font-medium text-neutral-200">{t("formulas.empty")}</p>
              <p className="mt-2 text-xs text-neutral-500">{t("formulas.emptyHint")}</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {formulas.map((row) => (
                <LandingFormulaSummaryCard key={row.id} formula={row} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-[0_0_40px_rgba(255,215,0,0.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-3xl space-y-5 md:space-y-6">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-200/65 sm:text-xs sm:tracking-[0.34em]">
                {t("portfolio.eyebrow")}
              </p>
              <div className="space-y-4 md:space-y-[1.125rem]">
                <h3
                  className={[
                    "text-pretty text-3xl font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[2.125rem] sm:leading-[1.1] sm:tracking-[-0.026em] md:text-4xl md:tracking-[-0.03em]",
                    "bg-gradient-to-br from-white via-[#f4f1ea] to-[#d9c9a8] bg-clip-text text-transparent",
                    "[filter:drop-shadow(0_0_28px_rgba(212,175,55,0.11))_drop-shadow(0_1px_0_rgba(255,255,255,0.12))]",
                  ].join(" ")}
                >
                  {t("portfolio.title")}
                </h3>
                <p className="max-w-2xl text-pretty text-[0.9375rem] font-normal leading-[1.72] tracking-[0.012em] text-neutral-400/78 antialiased md:text-base md:leading-[1.74] md:tracking-[0.01em] md:text-neutral-400/82">
                  {t("portfolio.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2">
            {PORTFOLIO_CARD_IDS.map((cardId) => (
              <article
                key={cardId}
                className={[
                  "group relative isolate overflow-hidden rounded-[2rem] p-6 sm:p-7",
                  "border border-white/[0.14]",
                  "bg-gradient-to-br from-white/[0.14] via-white/[0.05] to-black/25",
                  "backdrop-blur-2xl backdrop-saturate-150",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.12),0_12px_40px_-16px_rgba(0,0,0,0.5)]",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "hover:-translate-y-1 hover:border-amber-200/45",
                  "hover:from-white/[0.18] hover:via-amber-50/[0.07] hover:to-black/20",
                  "hover:shadow-[inset_0_0_72px_rgba(212,175,55,0.14),inset_0_1px_0_rgba(255,248,220,0.28),0_20px_50px_-14px_rgba(184,134,11,0.22)]",
                ].join(" ")}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 bg-[radial-gradient(ellipse_120%_90%_at_50%_-30%,rgba(255,236,180,0.22),transparent_58%),radial-gradient(ellipse_90%_70%_at_100%_100%,rgba(180,140,50,0.12),transparent_55%)]"
                />
                <div className="relative z-10">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/[0.15] bg-white/[0.08] text-amber-100/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-all duration-300 group-hover:border-amber-200/50 group-hover:bg-amber-50/[0.1] group-hover:text-amber-50 group-hover:shadow-[inset_0_0_28px_rgba(255,215,0,0.14),inset_0_1px_0_rgba(255,250,230,0.35)]">
                    {PORTFOLIO_ICONS[cardId]}
                  </div>
                  <h4 className="mt-6 text-xl font-semibold tracking-tight text-white">{t(`portfolio.cards.${cardId}.title`)}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                    {t(`portfolio.cards.${cardId}.subtitle`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ProfitabilityCalculator />
      </section>
      )}
    </main>
  );
}
