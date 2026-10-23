import { CurrencyCode } from "@prisma/client";

/** Subconjunto estrito alinhado ao enum Prisma `CurrencyCode` (fonte de verdade no DB). */
export const VAULT_CURRENCY_CODES = [CurrencyCode.USD, CurrencyCode.EUR, CurrencyCode.BRL] as const;

export type VaultCurrencyCode = (typeof VAULT_CURRENCY_CODES)[number];

const VAULT_SET = new Set<string>(VAULT_CURRENCY_CODES);

export function isVaultCurrencyCode(value: unknown): value is VaultCurrencyCode {
  return typeof value === "string" && VAULT_SET.has(value);
}

export function assertPrismaCurrencyCode(value: VaultCurrencyCode): CurrencyCode {
  return value;
}
