import type { CurrencyCode } from "@prisma/client";

import {
  assertPrismaCurrencyCode,
  isVaultCurrencyCode,
  type VaultCurrencyCode,
} from "@/types/currency";

export type { VaultCurrencyCode };
export { isVaultCurrencyCode };

export function parseCurrencyCode(raw: unknown): VaultCurrencyCode | undefined {
  if (!isVaultCurrencyCode(raw)) return undefined;
  return raw;
}

/** Moeda padrão de UI / lead com base no locale da interface. */
export function defaultCurrencyForUiLocale(locale: string): VaultCurrencyCode {
  if (locale === "pt") return "BRL";
  if (locale === "de") return "EUR";
  return "USD";
}

/** Aceite legal internacional (idioma do contrato). */
export function defaultCurrencyForLegalLang(lang: string): VaultCurrencyCode {
  if (lang === "pt") return "BRL";
  if (lang === "es" || lang === "de") return "EUR";
  return "USD";
}

export function toPrismaCurrencyCode(code: VaultCurrencyCode): CurrencyCode {
  return assertPrismaCurrencyCode(code);
}
