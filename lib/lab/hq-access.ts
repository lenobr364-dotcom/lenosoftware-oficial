/**
 * Atestação de acesso ao QG (Barra do Garças · CEP 78600-412) — camada adicional ao CEO + licença core.
 * Cookie HttpOnly assinado com HMAC; válido apenas enquanto a sessão CEO não expirar.
 */

import type { NextResponse } from "next/server";

import { CEO_SESSION_MAX_AGE } from "@/lib/ceo-session";
import { NEXUS_HQ } from "@/lib/nexus-legal-identity";

export const HQ_LAB_COOKIE = "chemvault_hq_lab";
export const HQ_LAB_SCOPE = `nexus-hq:${NEXUS_HQ.cep}`;

const HQ_MESSAGE_PREFIX = "chemvault-hq-lab-v1";

function hqSecret(): string {
  return (
    process.env.CHEMVAULT_HQ_LAB_SECRET?.trim() ||
    process.env.CHEMVAULT_SESSION_SECRET?.trim() ||
    process.env.AUTH_MASTER_KEY?.trim() ||
    "chemvault-dev-hq-lab"
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
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signHqLabToken(expUnixSec: number): Promise<string> {
  const message = `${HQ_MESSAGE_PREFIX}|${expUnixSec}|${HQ_LAB_SCOPE}`;
  const sig = await hmacSha256Hex(hqSecret(), message);
  return `${expUnixSec}.${sig}`;
}

export async function verifyHqLabToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const exp = Number.parseInt(parts[0] ?? "", 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = await signHqLabToken(exp);
  return timingSafeEqualHex(token, expected);
}

export function applyHqLabCookie(res: NextResponse, expUnixSec: number, token: string): void {
  const maxAge = Math.max(0, expUnixSec - Math.floor(Date.now() / 1000));
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(HQ_LAB_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    maxAge: maxAge > 0 ? maxAge : CEO_SESSION_MAX_AGE,
  });
}

export async function mintAndApplyHqLabCookie(res: NextResponse, expUnixSec: number): Promise<void> {
  const token = await signHqLabToken(expUnixSec);
  applyHqLabCookie(res, expUnixSec, token);
}

export function hqLabMeta() {
  return {
    scope: HQ_LAB_SCOPE,
    city: NEXUS_HQ.city,
    state: NEXUS_HQ.state,
    cep: NEXUS_HQ.cep,
    country: NEXUS_HQ.country,
  };
}
