import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import type { SealedPortalLicenseToken } from "@/types/licensing";

const TOKEN_VERSION = 1 as const;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export type PortalLicensePayloadV1 = {
  v: typeof TOKEN_VERSION;
  /** Stable license subject (tenant / entitlement id). */
  sub: string;
  /** Unix seconds */
  exp: number;
  tier?: string;
};

function deriveSealKey(): Buffer {
  const material =
    process.env.CHEMVAULT_LICENSE_SEAL_KEY?.trim() ||
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-license-seal";
  return createHash("sha256").update(material, "utf8").digest();
}

/** Issues an AES-256-GCM sealed portal license token (server-side tooling / partner API). */
export function sealPortalLicenseToken(payload: PortalLicensePayloadV1): SealedPortalLicenseToken {
  const iv = randomBytes(IV_LENGTH);
  const key = deriveSealKey();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = JSON.stringify(payload);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    String(TOKEN_VERSION),
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".") as SealedPortalLicenseToken;
}

export function unsealPortalLicenseToken(token: string | SealedPortalLicenseToken): PortalLicensePayloadV1 | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [vStr, ivB64, tagB64, ctB64] = parts;
  if (vStr !== String(TOKEN_VERSION) || !ivB64 || !tagB64 || !ctB64) return null;
  try {
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const ciphertext = Buffer.from(ctB64, "base64url");
    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) return null;
    const key = deriveSealKey();
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(plain) as Partial<PortalLicensePayloadV1>;
    if (parsed.v !== TOKEN_VERSION || typeof parsed.sub !== "string" || parsed.sub.length === 0) return null;
    if (typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) return null;
    return {
      v: TOKEN_VERSION,
      sub: parsed.sub,
      exp: parsed.exp,
      tier: typeof parsed.tier === "string" ? parsed.tier : undefined,
    };
  } catch {
    return null;
  }
}

export function isPortalLicensePayloadActive(payload: PortalLicensePayloadV1, nowMs = Date.now()): boolean {
  return payload.exp * 1000 > nowMs;
}
