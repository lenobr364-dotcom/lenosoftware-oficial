/**
 * Lógica internacional do laboratório digital (regiões, moeda, unidades).
 */

import { routing } from "@/i18n/routing";

export type LabMarketRegion = {
  id: string;
  labelKey: string;
  currency: "BRL" | "USD" | "EUR";
  demand: "critical" | "high" | "growing";
  localeHints: string[];
};

export const LAB_MARKET_REGIONS: LabMarketRegion[] = [
  {
    id: "latam",
    labelKey: "regionLatam",
    currency: "BRL",
    demand: "critical",
    localeHints: ["pt"],
  },
  {
    id: "europe",
    labelKey: "regionEurope",
    currency: "EUR",
    demand: "high",
    localeHints: ["de", "en"],
  },
  {
    id: "asia",
    labelKey: "regionAsia",
    currency: "USD",
    demand: "growing",
    localeHints: ["hi", "en"],
  },
  {
    id: "mena",
    labelKey: "regionMena",
    currency: "USD",
    demand: "high",
    localeHints: ["ar"],
  },
];

export function isSupportedLabLocale(locale: string): boolean {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export function resolveLabRegionForLocale(locale: string): LabMarketRegion {
  const match = LAB_MARKET_REGIONS.find((r) => r.localeHints.includes(locale));
  return match ?? LAB_MARKET_REGIONS[0];
}

export function formatLabCurrency(value: number, currency: LabMarketRegion["currency"], locale: string): string {
  const tag = locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : locale === "ar" ? "ar-SA" : "en-US";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const LAB_HQ = {
  city: "Barra do Garças",
  state: "MT",
  cep: "78600-412",
  country: "Brasil",
} as const;
