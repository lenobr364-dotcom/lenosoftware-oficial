/**
 * Sessão CEO (diretoria): cookie HttpOnly com HMAC + expiração.
 * Segredo: CHEMVAULT_SESSION_SECRET (preferido) ou AUTH_MASTER_KEY.
 * Assinatura válida para ADMIN_EMAIL (fluxo legacy /api/auth/ceo) e para
 * DIRETORIA_AUTH_EMAIL (default diretoria@lenosoftware.com · /api/auth/login).
 */

export const CEO_SESSION_COOKIE = "chemvault_ceo";
export const CEO_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

const CEO_MESSAGE_PREFIX = "chemvault-ceo-v1";

function sessionSecret(): string {
  return (
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const keyMaterial = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest("SHA-256", keyMaterial),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function signCeoSessionToken(emailNorm: string, expUnixSec: number): Promise<string> {
  const message = `${CEO_MESSAGE_PREFIX}|${expUnixSec}|${emailNorm}`;
  const sig = await hmacSha256Hex(sessionSecret(), message);
  return `${expUnixSec}.${sig}`;
}

/** E-mails que podem assinar o cookie de sessão da diretoria (CEO + login /api/auth/login). */
function ceoSessionSubjectCandidates(): string[] {
  const uniq = new Set<string>();
  const admin = process.env.ADMIN_EMAIL?.trim();
  if (admin) uniq.add(normalizeAdminEmail(admin));
  const diretoria = (process.env.DIRETORIA_AUTH_EMAIL ?? "diretoria@lenosoftware.com").trim();
  if (diretoria) uniq.add(normalizeAdminEmail(diretoria));
  return [...uniq];
}

export async function verifyCeoSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expStr] = parts;
  const exp = Number.parseInt(expStr ?? "", 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;

  const candidates = ceoSessionSubjectCandidates();
  if (candidates.length === 0) return false;

  for (const emailNorm of candidates) {
    const expected = await signCeoSessionToken(emailNorm, exp);
    if (timingSafeEqualHex(token, expected)) return true;
  }
  return false;
}
