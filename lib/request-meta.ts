import type { NextRequest } from "next/server";

/** ISO2 aproximado (CDN / proxy). Fallback `unknown`. */
export function inferCountryIso2FromHeaders(headers: Headers): string {
  const candidates = [
    headers.get("cf-ipcountry"),
    headers.get("x-vercel-ip-country"),
    headers.get("cloudfront-viewer-country"),
    headers.get("x-app-region"),
  ].filter(Boolean) as string[];
  const raw = candidates[0]?.trim().toUpperCase();
  if (!raw || raw.length > 8) return "unknown";
  return raw;
}

/** Região aproximada (CDN / proxy). Fallback `unknown`. */
export function inferRegionFromHeaders(request: NextRequest): string {
  return inferCountryIso2FromHeaders(request.headers);
}

export function clientIpHint(request: NextRequest): string | null {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  const real = request.headers.get("x-real-ip");
  return real?.trim() ?? null;
}

export function userAgentHint(request: NextRequest): string | null {
  const ua = request.headers.get("user-agent");
  if (!ua) return null;
  return ua.slice(0, 512);
}
