import { createHmac, timingSafeEqual } from "node:crypto";

export const INTL_LICENSE_ACCEPT_COOKIE = "cv_intl_license_accept";

const TTL_MS = 180 * 24 * 60 * 60 * 1000;

function secret(): string {
  return process.env.CHEMVAULT_SESSION_SECRET?.trim() || "chemvault-dev-secret-change-me";
}

export function signIntlLicenseAcceptCookie(acceptanceId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ v: 1 as const, scope: "intl_license", acceptanceId, exp }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyIntlLicenseAcceptCookie(token: string | undefined): string | null {
  if (!token || typeof token !== "string") return null;
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      v?: number;
      scope?: string;
      acceptanceId?: string;
      exp?: number;
    };
    if (parsed.v !== 1 || parsed.scope !== "intl_license" || typeof parsed.acceptanceId !== "string" || typeof parsed.exp !== "number")
      return null;
    if (Date.now() >= parsed.exp) return null;
    return parsed.acceptanceId;
  } catch {
    return null;
  }
}
