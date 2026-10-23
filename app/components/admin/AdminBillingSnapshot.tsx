"use client";

import { glassPanelDense } from "@/lib/ui-glass";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

type Billing = {
  activeLicenseTokens30d: number;
  approvedDealsByCurrency: { currencyCode: string; count: number }[];
  projectedAnnualRevenueByCurrency: { currencyCode: string; amount: number }[];
};

export function AdminBillingSnapshot({ billing }: { billing: Billing }) {
  const t = useTranslations("Dashboard.adminMonitor.billing");
  const locale = useLocale();

  const fmt = useMemo(() => {
    const tag =
      locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "ar" ? "ar-SA" : locale === "hi" ? "hi-IN" : "en-US";
    return (currency: string, amount: number) =>
      new Intl.NumberFormat(tag, {
        style: "currency",
        currency: currency === "BRL" ? "BRL" : currency === "EUR" ? "EUR" : "USD",
        maximumFractionDigits: 0,
      }).format(amount);
  }, [locale]);

  return (
    <section className={`p-6 ${glassPanelDense}`}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-200/90">{t("title")}</h2>
      <p className="mb-6 text-xs leading-relaxed text-neutral-400">{t("subtitle")}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-neutral-500">{t("activeTokens")}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{billing.activeLicenseTokens30d}</p>
          <p className="mt-1 text-[0.65rem] text-neutral-500">{t("activeTokensHint")}</p>
        </div>
        {(["USD", "EUR", "BRL"] as const).map((code) => {
          const row = billing.projectedAnnualRevenueByCurrency.find((r) => r.currencyCode === code);
          const deals = billing.approvedDealsByCurrency.find((r) => r.currencyCode === code);
          const amount = row?.amount ?? 0;
          const count = deals?.count ?? 0;
          return (
            <div key={code} className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-neutral-500">
                {t("projectedAnnual", { currency: code })}
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums text-emerald-100/95">{fmt(code, amount)}</p>
              <p className="mt-1 text-[0.65rem] text-neutral-500">{t("dealCount", { count })}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
