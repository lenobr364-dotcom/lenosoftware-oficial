import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "cvk-scrypt1:";
const KEY_ID_BYTES = 8;
const SECRET_BYTES = 24;

export function generateKeyId(): string {
  return randomBytes(KEY_ID_BYTES).toString("hex");
}

export function generateKeySecret(): string {
  return randomBytes(SECRET_BYTES).toString("base64url");
}

export function formatApiKey(keyId: string, secret: string): string {
  return `cvk_live_${keyId}.${secret}`;
}

export function parseApiKey(raw: string): { keyId: string; secret: string } | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("cvk_live_")) return null;
  const rest = trimmed.slice("cvk_live_".length);
  const dot = rest.indexOf(".");
  if (dot <= 0) return null;
  const keyId = rest.slice(0, dot);
  const secret = rest.slice(dot + 1);
  if (!/^[a-f0-9]{16}$/i.test(keyId) || secret.length < 16) return null;
  return { keyId, secret };
}

export function keyPrefix(keyId: string): string {
  return `cvk_live_${keyId.slice(0, 8)}…`;
}

export function hashApiKeySecret(secret: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(secret, salt, 64);
  return `${SCRYPT_PREFIX}${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyApiKeySecret(secret: string, stored: string): boolean {
  if (!stored.startsWith(SCRYPT_PREFIX)) return false;
  const rest = stored.slice(SCRYPT_PREFIX.length);
  const [saltHex, hashHex] = rest.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(secret, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
