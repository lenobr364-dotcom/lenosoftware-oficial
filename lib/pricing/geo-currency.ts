import type { PricingCurrency } from "./plans";

const EU_EEA = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "CH",
  "AD",
  "MC",
  "SM",
  "VA",
]);

/**
 * Moeda de destaque na pricing page: geo (CDN) com fallback no locale da UI.
 */
export function resolvePricingHighlightCurrency(countryIso2: string, uiLocale: string): PricingCurrency {
  const c = countryIso2.trim().toUpperCase();
  if (c === "BR") return "BRL";
  if (EU_EEA.has(c)) return "EUR";
  if (c === "unknown") {
    if (uiLocale === "pt") return "BRL";
    if (uiLocale === "de") return "EUR";
    return "USD";
  }
  return "USD";
}
