import { createHmac, timingSafeEqual } from "node:crypto";

const PREFIX = "chemvault-totp-enroll-v1";
export const CEO_TOTP_ENROLL_COOKIE = "chemvault_ceo_totp_enroll";

type TotpEnrollPayload = {
  expSec: number;
  secretBase32: string;
};

function sessionMaterial(): string {
  return (
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
}

function encode(p: TotpEnrollPayload): string {
  return Buffer.from(JSON.stringify(p), "utf8").toString("base64url");
}

function decode(s: string): TotpEnrollPayload | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as TotpEnrollPayload;
  } catch {
    return null;
  }
}

export function signTotpEnrollPending(payload: TotpEnrollPayload): string {
  const body = encode(payload);
  const sig = createHmac("sha256", sessionMaterial()).update(`${PREFIX}|${body}`).digest("hex");
  return `${body}.${sig}`;
}

export function verifyTotpEnrollToken(token: string | undefined): TotpEnrollPayload | null {
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
  if (!p || typeof p.expSec !== "number" || typeof p.secretBase32 !== "string") return null;
  if (p.expSec * 1000 < Date.now()) return null;
  if (p.secretBase32.length < 8) return null;
  return p;
}

export function buildTotpEnrollPending(secretBase32: string, ttlSec: number): string {
  const payload: TotpEnrollPayload = {
    expSec: Math.floor(Date.now() / 1000) + ttlSec,
    secretBase32,
  };
  return signTotpEnrollPending(payload);
}
