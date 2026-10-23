import type { AdminMfaFactor } from "./policy";
import { parseMfaRaw, pickActiveFactorFromFactors } from "./policy";
import { resolvedTotpSecret } from "./resolver";

/** Normaliza input do painel: `null` limpa override na BD. */
export function normalizeAdminMfaOverrideInput(input: string | null): string | null {
  if (input === null) return null;
  const t = input.trim().toLowerCase();
  if (!t || t === "off") return "off";
  const parts = t.split(/[|,]+/).map((s) => s.trim()).filter(Boolean) as AdminMfaFactor[];
  for (const p of parts) {
    if (p !== "totp" && p !== "email") {
      throw new Error("invalid_mfa_tokens");
    }
  }
  if (parts.length === 0) return "off";
  return parts.join("|");
}

/** Garante que a combinação escolhida tem pelo menos um fator operacional (TOTP com secret, e-mail com ADMIN_EMAIL). */
export async function assertMfaOverrideViable(storedOverride: string | null): Promise<void> {
  const raw =
    storedOverride?.trim().toLowerCase() ||
    process.env.CHEMVAULT_ADMIN_MFA?.trim().toLowerCase() ||
    "off";
  const factors = parseMfaRaw(raw);
  if (factors.length === 0) return;
  const totpSec = await resolvedTotpSecret();
  const active = pickActiveFactorFromFactors(factors, totpSec);
  if (!active) {
    throw new Error("invalid_mfa_configuration");
  }
}
