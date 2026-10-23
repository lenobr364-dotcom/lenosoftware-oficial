import { PricingPageClient } from "@/app/components/pricing/PricingPageClient";
import { inferCountryIso2FromHeaders } from "@/lib/request-meta";
import { convertUsdTo } from "@/lib/pricing/fx-usd";
import { resolvePricingHighlightCurrency } from "@/lib/pricing/geo-currency";
import { PLAN_USD_MONTHLY, planIds, type PlanTierId } from "@/lib/pricing/plans";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}/pricing`]),
  );
  languages["x-default"] = `${baseUrl}/en/pricing`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${baseUrl}/${locale}/pricing`, languages },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const h = await headers();
  const country = inferCountryIso2FromHeaders(h);
  const highlight = resolvePricingHighlightCurrency(country, locale);

  const plans = planIds().map((id: PlanTierId) => {
    const usd = PLAN_USD_MONTHLY[id];
    return {
      id,
      usd,
      eur: convertUsdTo(usd, "EUR"),
      brl: convertUsdTo(usd, "BRL"),
    };
  });

  return (
    <PricingPageClient locale={locale} countryIso2={country} highlightCurrency={highlight} plans={plans} />
  );
}
