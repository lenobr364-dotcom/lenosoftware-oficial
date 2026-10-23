import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";

const PREFIX = "chemvault-mfa-pending-v1";
const COOKIE = "chemvault_ceo_mfa";

export { COOKIE as CEO_MFA_PENDING_COOKIE };

export type MfaPendingKind = "totp" | "email";

export type MfaPendingPayload = {
  kind: MfaPendingKind;
  emailNorm: string;
  expSec: number;
  /** Salt hex para OTP por e-mail */
  otpSalt?: string;
  /** SHA-256 hex de `${code}|${otpSalt}|${sessionSecret}` */
  otpHash?: string;
};

function sessionMaterial(): string {
  return (
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
}

function encode(p: MfaPendingPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

function decode(s: string): MfaPendingPayload | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as MfaPendingPayload;
  } catch {
    return null;
  }
}

export function signMfaPending(payload: MfaPendingPayload): string {
  const body = encode(payload);
  const sig = createHmac("sha256", sessionMaterial()).update(`${PREFIX}|${body}`).digest("hex");
  return `${body}.${sig}`;
}

export function verifyMfaPendingToken(token: string | undefined): MfaPendingPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", sessionMaterial()).update(`${PREFIX}|${body}`).digest("hex");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }
  const p = decode(body);
  if (!p || typeof p.expSec !== "number") return null;
  if (p.expSec * 1000 < Date.now()) return null;
  return p;
}

export function buildTotpPending(emailNorm: string, ttlSec: number): { token: string; payload: MfaPendingPayload } {
  const payload: MfaPendingPayload = {
    kind: "totp",
    emailNorm,
    expSec: Math.floor(Date.now() / 1000) + ttlSec,
  };
  return { payload, token: signMfaPending(payload) };
}

export function buildEmailOtpPending(emailNorm: string, ttlSec: number): { token: string; payload: MfaPendingPayload; code: string } {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const otpSalt = randomInt(0, 2 ** 31)
    .toString(16)
    .padStart(8, "0");
  const otpHash = createHash("sha256")
    .update(`${code}|${otpSalt}|${sessionMaterial()}`, "utf8")
    .digest("hex");
  const payload: MfaPendingPayload = {
    kind: "email",
    emailNorm,
    expSec: Math.floor(Date.now() / 1000) + ttlSec,
    otpSalt,
    otpHash,
  };
  return { payload, token: signMfaPending(payload), code };
}

export function verifyEmailOtpCode(payload: MfaPendingPayload, code: string): boolean {
  if (payload.kind !== "email" || !payload.otpHash || !payload.otpSalt) return false;
  const trimmed = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const h = createHash("sha256")
    .update(`${trimmed}|${payload.otpSalt}|${sessionMaterial()}`, "utf8")
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(payload.otpHash, "hex"));
  } catch {
    return false;
  }
}
