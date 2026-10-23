/**
 * Sessão de licença do núcleo (cookie HttpOnly, HMAC-SHA256, compatível com Edge / middleware).
 * Emitida após `/api/auth`, `/api/auth/ceo` ou `/api/vault/unlock` bem-sucedidos.
 */

import type { NextResponse } from "next/server";

import type { CoreLicenseSessionPayloadV1 } from "@/types/licensing";
import { toLicensePrincipalId } from "@/types/licensing";

export const CORE_LICENSE_COOKIE = "chemvault_core_license";

const MESSAGE_PREFIX = "chemvault-core-v1";

function chemvaultSecret(): string {
  return (
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-session"
  );
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

function utf8ToBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64UrlToUtf8(b64url: string): string {
  const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export type CoreLicenseMint = { token: string; maxAge: number };

export async function mintCoreLicenseSession(subject: string, maxAgeSec: number): Promise<CoreLicenseMint> {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const sub = toLicensePrincipalId(subject);
  const body: CoreLicenseSessionPayloadV1 = { v: 1, exp, sub };
  const payload = JSON.stringify(body);
  const payloadB64 = utf8ToBase64Url(payload);
  const sig = await hmacSha256Hex(chemvaultSecret(), `${MESSAGE_PREFIX}|${payloadB64}`);
  return { token: `${payloadB64}.${sig}`, maxAge: maxAgeSec };
}

async function parseVerifiedCoreLicense(
  token: string | undefined,
): Promise<{ exp: number; sub: string } | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;
  const payloadB64 = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const expectedSig = await hmacSha256Hex(chemvaultSecret(), `${MESSAGE_PREFIX}|${payloadB64}`);
  if (!timingSafeEqualHex(sigHex, expectedSig)) return null;
  let parsed: { v?: number; exp?: number; sub?: string };
  try {
    parsed = JSON.parse(decodeBase64UrlToUtf8(payloadB64)) as { v?: number; exp?: number; sub?: string };
  } catch {
    return null;
  }
  if (parsed.v !== 1 || typeof parsed.exp !== "number" || typeof parsed.sub !== "string" || parsed.sub.length === 0) {
    return null;
  }
  try {
    const sub = toLicensePrincipalId(parsed.sub);
    return { exp: parsed.exp, sub };
  } catch {
    return null;
  }
}

export async function verifyCoreLicenseSession(token: string | undefined): Promise<boolean> {
  const p = await parseVerifiedCoreLicense(token);
  return p !== null && p.exp * 1000 > Date.now();
}

/** Subject da licença core se o token for válido e não expirado; caso contrário `null`. */
export async function getCoreLicenseSubjectIfValid(token: string | undefined): Promise<string | null> {
  const p = await parseVerifiedCoreLicense(token);
  if (!p || p.exp * 1000 <= Date.now()) return null;
  return p.sub;
}

export function applyCoreLicenseCookie(res: NextResponse, mint: CoreLicenseMint): void {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(CORE_LICENSE_COOKIE, mint.token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: mint.maxAge,
  });
}
