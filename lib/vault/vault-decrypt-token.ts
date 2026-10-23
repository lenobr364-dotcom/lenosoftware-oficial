import { createHmac, timingSafeEqual } from "node:crypto";

const VAULT_DECRYPT_TTL_MS = 5 * 60 * 1000;

export type VaultDecryptTokenClaims = {
  v: 1;
  scope: "vault_decrypt";
  licenseId: string;
  formulaId: string;
  exp: number;
};

function vaultSecret(): string {
  return (
    process.env.CHEMVAULT_VAULT_DECRYPT_SECRET?.trim() ||
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    "chemvault-vault-decrypt-dev-secret"
  );
}

export function mintVaultDecryptAccessToken(licenseId: string, formulaId: string): {
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
} {
  const exp = Date.now() + VAULT_DECRYPT_TTL_MS;
  const claims: VaultDecryptTokenClaims = {
    v: 1,
    scope: "vault_decrypt",
    licenseId,
    formulaId,
    exp,
  };
  const payload = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  const sig = createHmac("sha256", vaultSecret()).update(payload).digest("base64url");
  return {
    token: `${payload}.${sig}`,
    expiresAt: new Date(exp).toISOString(),
    expiresInSeconds: Math.floor(VAULT_DECRYPT_TTL_MS / 1000),
  };
}

export function verifyVaultDecryptAccessToken(
  token: string,
  expected: { licenseId: string; formulaId: string },
): boolean {
  const i = token.lastIndexOf(".");
  if (i <= 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expectedSig = createHmac("sha256", vaultSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as VaultDecryptTokenClaims;
    if (parsed.v !== 1 || parsed.scope !== "vault_decrypt") return false;
    if (parsed.licenseId !== expected.licenseId || parsed.formulaId !== expected.formulaId) return false;
    if (typeof parsed.exp !== "number" || Date.now() >= parsed.exp) return false;
    return true;
  } catch {
    return false;
  }
}
