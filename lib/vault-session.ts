import { createHmac, timingSafeEqual } from "node:crypto";

// ─── ChemVault landing formula vault (?chemvault=1) — cookie separado ───

export const VAULT_GATE_COOKIE = "chemvault_vault_gate";

const FORMULA_VAULT_TTL_MS = 2 * 60 * 60 * 1000;

function chemvaultSecret(): string {
  return process.env.CHEMVAULT_SESSION_SECRET?.trim() || "chemvault-dev-secret-change-me";
}

export function signVaultGateToken(): string {
  const exp = Date.now() + FORMULA_VAULT_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ v: 1 as const, scope: "formula_vault", exp }), "utf8").toString("base64url");
  const sig = createHmac("sha256", chemvaultSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyVaultGateToken(token: string | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  const i = token.lastIndexOf(".");
  if (i <= 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", chemvaultSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      v?: number;
      scope?: string;
      exp?: number;
    };
    if (parsed.v !== 1 || parsed.scope !== "formula_vault" || typeof parsed.exp !== "number") return false;
    return Date.now() < parsed.exp;
  } catch {
    return false;
  }
}

// ─── Portão legado /api/auth (parceria Leno César & Lumen Onel · chave Leno&Lumen) + /api/client-access ───

export const SESSION_COOKIE_NAME = "chemvault_portal_gate";

export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 12;

const PORTAL_PREFIX = "chemvault-portal-v1";

function portalSecret(): string {
  return (
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function computeGateToken(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_COOKIE_MAX_AGE;
  const message = `${PORTAL_PREFIX}|${exp}`;
  const sig = createHmac("sha256", portalSecret()).update(message).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyGateToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expStr, sig] = parts;
  const exp = Number.parseInt(expStr ?? "", 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const message = `${PORTAL_PREFIX}|${exp}`;
  const expected = createHmac("sha256", portalSecret()).update(message).digest("hex");
  return timingSafeEqualHex(sig, expected);
}
