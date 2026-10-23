/** Indicative vault economics: BRL base → display ISO currencies (non-binding FX). */

function parseRate(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

const FROM_BRL_RATES = () =>
  ({
    BRL: 1,
    USD: parseRate("VAULT_FX_BRL_TO_USD", 0.182),
    EUR: parseRate("VAULT_FX_BRL_TO_EUR", 0.168),
    INR: parseRate("VAULT_FX_BRL_TO_INR", 15.1),
  }) as const;

/** US liquid gallon ↔ liter (definition). */
export const LITERS_PER_US_GALLON = 3.785411784;

export type VaultDisplayCurrency = keyof ReturnType<typeof FROM_BRL_RATES>;

/** en / hi: volumes in US gal; pt / de / ar: metric-first presentation. */
export function usesImperialDisplay(locale: string): boolean {
  return locale === "en" || locale === "hi";
}

export function litersToUsGallons(liters: number): number {
  return liters / LITERS_PER_US_GALLON;
}

export function kgToPounds(kg: number): number {
  return kg * 2.20462262185;
}

/**
 * Default display ISO currency by locale / region:
 * - Americas desk → USD
 * - DACH / EU deck → EUR
 * - Brasil → BRL
 * - Árabes (ex.: GCC) → USD (âncora comum em contratos internacionais)
 * - Índia → INR (mantido para o locale `hi` existente)
 */
export function displayCurrencyForLocale(locale: string): VaultDisplayCurrency {
  if (locale === "pt") return "BRL";
  if (locale === "de") return "EUR";
  if (locale === "ar") return "USD";
  if (locale === "hi") return "INR";
  return "USD";
}

export function convertBrlToDisplay(amountBrl: number, locale: string): number {
  const table = FROM_BRL_RATES();
  const code = displayCurrencyForLocale(locale);
  return amountBrl * table[code];
}

export function localeTagForFormat(locale: string): string {
  if (locale === "pt") return "pt-BR";
  if (locale === "de") return "de-DE";
  if (locale === "hi") return "hi-IN";
  if (locale === "ar") return "ar-AE";
  return "en-US";
}
