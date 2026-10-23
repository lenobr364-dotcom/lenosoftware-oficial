"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

export function CheckoutSuccessClient({ locale, sessionId }: { locale: string; sessionId: string }) {
  const t = useTranslations("CheckoutSuccess");
  const [seconds, setSeconds] = useState(5);

  const invoiceHref = useMemo(() => `/api/invoice/pdf?session_id=${encodeURIComponent(sessionId)}`, [sessionId]);

  useEffect(() => {
    let stopped = false;
    let left = 5;
    const id = window.setInterval(() => {
      if (stopped) return;
      left -= 1;
      setSeconds(left);
      if (left <= 0) {
        stopped = true;
        window.clearInterval(id);
        window.location.assign(`/${locale}/dashboard#cv-tour-formula-catalog`);
      }
    }, 1000);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [locale]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#03050a] px-5 py-16 text-white sm:px-8 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(34,211,238,0.18),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-lg text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/85">{t("eyebrow")}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400 md:text-base">{t("subtitle")}</p>
        <p className="mt-6 text-xs text-amber-200/85">{t("partnership")}</p>
        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <a
            href={invoiceHref}
            className="inline-flex items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-500/15 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-violet-100 transition hover:bg-violet-500/25"
          >
            {t("downloadInvoice")}
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-500/15 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-500/25"
          >
            {t("goToVault")}
          </Link>
        </div>
        <p className="mt-8 text-sm text-neutral-500">{t("redirectHint", { seconds: Math.max(0, seconds) })}</p>
      </div>
    </main>
  );
}
