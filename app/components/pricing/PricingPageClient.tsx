"use client";

import { Link } from "@/i18n/navigation";
import { localeTagForFormat } from "@/lib/market-scalability-fx";
import { pricingCheckoutErrorMessage } from "@/lib/pricing/checkout-error-messages";
import type { PlanTierId } from "@/lib/pricing/plans";
import type { PricingCurrency } from "@/lib/pricing/plans";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

export type PlanPriceRow = { id: PlanTierId; usd: number; eur: number; brl: number };

function formatMoney(amount: number, currency: PricingCurrency, locale: string): string {
  return new Intl.NumberFormat(localeTagForFormat(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

type PricingCardSpec = {
  id: PlanTierId;
  name: string;
  tagline: string;
  badge?: string;
  highlight?: boolean;
  bullets: string[];
  cta: { label: string; kind: "stripe" | "consultant" };
};

function countryLabel(iso: string, locale: string): string {
  const c = iso.trim().toUpperCase();
  if (!c || c === "UNKNOWN") return "—";
  try {
    return new Intl.DisplayNames([localeTagForFormat(locale)], { type: "region" }).of(c) ?? c;
  } catch {
    return c;
  }
}

function PlanCardPulse({ planId, children }: { planId: PlanTierId; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || sent.current) return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.25) {
            sent.current = true;
            void fetch("/api/sales/pulse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: planId }),
            });
            ob.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [planId]);

  return (
    <div ref={ref} className="h-full">
      {children}
    </div>
  );
}

export function PricingPageClient({
  locale,
  countryIso2,
  highlightCurrency,
  plans,
}: {
  locale: string;
  countryIso2: string;
  highlightCurrency: PricingCurrency;
  plans: PlanPriceRow[];
}) {
  const t = useTranslations("Pricing");
  const [pending, setPending] = useState<null | { plan: PlanTierId; channel: "stripe" | "paypal" }>(null);
  const checkoutLockRef = useRef(false);
  const checkoutBusy = pending !== null;

  const checkoutStripe = useCallback(
    async (plan: PlanTierId) => {
      if (checkoutLockRef.current) return;
      checkoutLockRef.current = true;
      setPending({ plan, channel: "stripe" });
      try {
        const r = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, currency: highlightCurrency, locale }),
        });
        const j = (await r.json()) as { ok?: boolean; error?: string; url?: string | null; configured?: boolean };
        if (!r.ok) {
          toast.error(pricingCheckoutErrorMessage(t, j.error));
          return;
        }
        if (j.url) window.location.href = j.url;
        else toast(t("checkoutStripePrep"));
      } catch {
        toast.error(pricingCheckoutErrorMessage(t, "connection_failed"));
      } finally {
        checkoutLockRef.current = false;
        setPending(null);
      }
    },
    [highlightCurrency, locale, t],
  );

  // PayPal checkout intentionally hidden in current UX.
  // (We keep the API integration in the codebase; only the UI is simplified.)

  const amountFor = (p: PlanPriceRow, cur: PricingCurrency) => {
    if (cur === "USD") return p.usd;
    if (cur === "EUR") return p.eur;
    return p.brl;
  };

  const byId = new Map(plans.map((p) => [p.id, p] as const));

  const cards: PricingCardSpec[] = [
    {
      id: "standard",
      name: "Plano Startup",
      tagline: "Para laboratórios pequenos que precisam licenciar com segurança.",
      bullets: ["Licenciamento de até 3 fórmulas", "Acesso ao cofre e trilha de auditoria", "Suporte essencial (horário comercial)"],
      cta: { label: "Começar agora", kind: "stripe" },
    },
    {
      id: "global",
      name: "Plano Industrial",
      tagline: "O mais vendido para operação contínua e escala global.",
      badge: "Mais vendido · Blindagem Premium",
      highlight: true,
      bullets: ["Licenciamento ilimitado", "Suporte técnico 24/7", "Selo de Blindagem Premium", "Governança e rastreabilidade avançadas"],
      cta: { label: "Assinar Industrial", kind: "stripe" },
    },
    {
      id: "enterprise",
      name: "Plano Enterprise",
      tagline: "Personalizado para multinacionais e requisitos regulatórios.",
      bullets: ["Contrato sob medida (SLA, compliance, regiões)", "Integrações e políticas avançadas", "Gestão dedicada (opcional)"],
      cta: { label: "Falar com um Consultor", kind: "consultant" },
    },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050505] px-5 py-10 text-white sm:px-8 md:px-12 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute -right-48 top-24 h-[560px] w-[560px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-280px] left-1/3 h-[560px] w-[560px] rounded-full bg-[#D4AF37]/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/80">ChemVault Global · Pricing</p>
            <h1 className="mt-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-3xl font-black uppercase italic tracking-tighter text-transparent md:text-5xl">
              Planos para blindar e licenciar suas fórmulas
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
              Escolha o plano ideal para seu laboratório — do primeiro cofre ao padrão industrial com blindagem premium.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Região detectada: <span className="text-gray-300">{countryLabel(countryIso2, locale)}</span> · moeda destaque:{" "}
              <span className="text-gray-200">
                {highlightCurrency} {formatMoney(amountFor(byId.get("global") ?? plans[0]!, highlightCurrency), highlightCurrency, locale)} / mês
              </span>
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 self-start rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-200 transition hover:border-[#D4AF37]/25 hover:text-white"
          >
            Voltar
          </Link>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map((c) => {
            const p = byId.get(c.id);
            const price = p ? formatMoney(amountFor(p, highlightCurrency), highlightCurrency, locale) : "—";
            return (
              <PlanCardPulse key={c.id} planId={c.id}>
                <article
                  className={[
                    "relative flex h-full flex-col rounded-[2rem] border p-7 shadow-[0_0_64px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
                    c.highlight
                      ? "border-[#D4AF37]/55 bg-gradient-to-b from-[#D4AF37]/10 via-white/[0.04] to-black/40 shadow-[0_0_0_1px_rgba(212,175,55,0.18),0_0_64px_rgba(212,175,55,0.10)]"
                      : "border-white/10 bg-white/[0.04]",
                  ].join(" ")}
                >
                  {c.highlight ? (
                    <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent" />
                  ) : null}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-white">{c.name}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-400">{c.tagline}</p>
                    </div>
                    {c.badge ? (
                      <span className="shrink-0 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                        {c.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Preço mensal</p>
                    <p className="mt-3 text-3xl font-black tabular-nums tracking-tight text-white">{price}</p>
                    <p className="mt-2 text-xs text-gray-500">Cobrança recorrente · cancelamento a qualquer momento</p>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-gray-300">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37]">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7">
                    {c.cta.kind === "stripe" ? (
                      <button
                        type="button"
                        disabled={checkoutBusy}
                        aria-busy={pending?.plan === c.id && pending?.channel === "stripe"}
                        onClick={() => void checkoutStripe(c.id)}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition disabled:cursor-not-allowed disabled:opacity-55",
                          c.highlight
                            ? "border-[#D4AF37]/65 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/85 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25"
                            : "border-white/15 bg-white/[0.06] text-gray-200 hover:border-[#D4AF37]/35 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20",
                        ].join(" ")}
                      >
                        {pending?.plan === c.id && pending?.channel === "stripe" ? "Processando…" : c.cta.label}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toast("Consultoria premium: deixe seu contato e te chamamos em seguida.");
                          window.location.href =
                            "mailto:consultor@chemvault.global?subject=ChemVault%20Global%20-%20Consultoria%20Enterprise";
                        }}
                        className="w-full rounded-2xl border border-[#D4AF37]/65 bg-[#D4AF37]/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37] transition hover:border-[#D4AF37]/85 hover:bg-[#D4AF37]/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25"
                      >
                        {c.cta.label}
                      </button>
                    )}
                  </div>
                </article>
              </PlanCardPulse>
            );
          })}
        </section>

        <footer className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.04] px-7 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gray-500">Parceria</p>
          <p className="mt-3 text-sm text-gray-400">Leno César &amp; Lumen Onel</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                toast("Consultor ChemVault: abrindo canal de contato…");
                window.location.href =
                  "mailto:consultor@chemvault.global?subject=ChemVault%20Global%20-%20Falar%20com%20um%20Consultor";
              }}
              className="inline-flex items-center justify-center rounded-2xl border border-[#D4AF37]/70 bg-[#D4AF37]/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37] transition hover:border-[#D4AF37]/90 hover:bg-[#D4AF37]/20 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25"
            >
              Falar com um Consultor
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-200 transition hover:border-[#D4AF37]/25"
            >
              Voltar para a landing
            </Link>
          </div>
          <p className="mt-8 text-xs text-gray-600">ChemVault Global · licenciamento, custódia e blindagem de dados.</p>
        </footer>
      </div>
    </main>
  );
}
