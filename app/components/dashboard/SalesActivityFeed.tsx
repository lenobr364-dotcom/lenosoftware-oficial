"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

type PlanKey = "standard" | "enterprise" | "global";

type Ev = {
  id: string;
  at: number;
  countryLabel: string;
  plan: PlanKey;
};

function planLabel(t: ReturnType<typeof useTranslations>, plan: PlanKey): string {
  if (plan === "standard") return t("salesFeedPlanStandard");
  if (plan === "enterprise") return t("salesFeedPlanEnterprise");
  return t("salesFeedPlanGlobal");
}

function formatTime(isoLocale: string, ts: number): string {
  try {
    return new Intl.DateTimeFormat(isoLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(ts);
  } catch {
    return new Date(ts).toLocaleTimeString();
  }
}

export function SalesActivityFeed({ locale }: { locale: string }) {
  const t = useTranslations("Dashboard");
  const [events, setEvents] = useState<Ev[]>([]);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/sales-feed", { credentials: "include" });
      if (!r.ok) return;
      const j = (await r.json()) as { ok?: boolean; events?: Ev[] };
      if (j.ok && Array.isArray(j.events)) setEvents(j.events);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t0 = window.setTimeout(() => void load(), 0);
    const id = window.setInterval(() => void load(), 12_000);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, [load]);

  const iso = locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "ar" ? "ar" : locale === "hi" ? "hi-IN" : "en-US";

  return (
    <section
      className="mb-10 rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-500/[0.07] via-black/40 to-fuchsia-500/[0.06] p-6 shadow-[0_0_40px_rgba(251,191,36,0.06)] backdrop-blur-xl"
      aria-labelledby="sales-feed-heading"
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-amber-200/75">{t("salesFeedEyebrow")}</p>
      <h2 id="sales-feed-heading" className="mt-2 text-lg font-semibold text-white md:text-xl">
        {t("salesFeedTitle")}
      </h2>
      <p className="mt-1 text-xs text-neutral-500">{t("salesFeedSubtitle")}</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-200">
        {events.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-neutral-500">{t("salesFeedEmpty")}</li>
        ) : (
          events.slice(0, 10).map((e) => (
            <li key={e.id} className="rounded-xl border border-white/[0.07] bg-black/35 px-3 py-2">
              {t("salesFeedLine", { country: e.countryLabel, plan: planLabel(t, e.plan) })}
              <span className="mt-1 block text-[0.65rem] text-neutral-500">
                {t("salesFeedUpdated", { time: formatTime(iso, e.at) })}
              </span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
