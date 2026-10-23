/**
 * Conversões indicativas USD ↔ BRL ↔ EUR a partir das mesmas taxas que o cofre (`VAULT_FX_BRL_TO_*`).
 * Valores comerciais finais vivem no contrato; isto serve à UI de pricing.
 */

function parseRate(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function brlToUsd(): number {
  return parseRate("VAULT_FX_BRL_TO_USD", 0.182);
}

function brlToEur(): number {
  return parseRate("VAULT_FX_BRL_TO_EUR", 0.168);
}

/** Quanto 1 USD vale em BRL (derivado de BRL→USD). */
export function usdToBrlRate(): number {
  return 1 / brlToUsd();
}

/** Quanto 1 USD vale em EUR (cruz via BRL). */
export function usdToEurRate(): number {
  return brlToEur() / brlToUsd();
}

export function convertUsdTo(amountUsd: number, code: "USD" | "EUR" | "BRL"): number {
  if (code === "USD") return amountUsd;
  if (code === "BRL") return amountUsd * usdToBrlRate();
  return amountUsd * usdToEurRate();
}
