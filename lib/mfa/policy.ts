export type AdminMfaFactor = "totp" | "email";

const MFA_ENV = "CHEMVAULT_ADMIN_MFA";

/** Interpreta string de configuração MFA (env ou BD). */
export function parseMfaRaw(raw: string): AdminMfaFactor[] {
  const r = raw.trim().toLowerCase();
  if (!r || r === "off" || r === "false" || r === "0") return [];
  return r
    .split(/[|,]+/)
    .map((s) => s.trim())
    .filter((s): s is AdminMfaFactor => s === "totp" || s === "email");
}

/** Lê política MFA administrativa só a partir do env (default: desligado). */
export function readAdminMfaFactors(): AdminMfaFactor[] {
  const raw = process.env[MFA_ENV]?.trim().toLowerCase() ?? "off";
  return parseMfaRaw(raw);
}

export function adminMfaEnabled(): boolean {
  return readAdminMfaFactors().length > 0;
}

/** Primeiro fator válido dada lista e secret TOTP opcional (env ou BD). */
export function pickActiveFactorFromFactors(factors: AdminMfaFactor[], totpSecret: string | null | undefined): AdminMfaFactor | null {
  for (const f of factors) {
    if (f === "totp") {
      const sec = totpSecret?.trim();
      if (sec && sec.length >= 8) return "totp";
      continue;
    }
    if (f === "email") {
      if (process.env.ADMIN_EMAIL?.trim()) return "email";
    }
  }
  return null;
}

/** @deprecated para fluxos dinâmicos use `activeAdminMfaFactorAsync` em `lib/mfa/resolver.ts`. */
export function activeAdminMfaFactor(): AdminMfaFactor | null {
  const sec = process.env.CHEMVAULT_ADMIN_TOTP_SECRET?.trim();
  return pickActiveFactorFromFactors(readAdminMfaFactors(), sec ?? null);
}
