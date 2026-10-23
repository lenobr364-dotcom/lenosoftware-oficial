/**
 * Cabeçalhos de segurança — TLS na borda + políticas de conteúdo e isolamento.
 */

import type { NextResponse } from "next/server";

export type SecurityProfile = "page" | "api" | "lab";

const BASE_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-DNS-Prefetch-Control": "off",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const PAGE_CSP =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; " +
  "img-src 'self' data: blob: https:; font-src 'self' data:; " +
  "style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "connect-src 'self' https: wss:; upgrade-insecure-requests";

const LAB_CSP =
  "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; " +
  "img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
  "script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests";

const API_HEADERS: Record<string, string> = {
  ...BASE_HEADERS,
  "Cache-Control": "no-store",
  "Pragma": "no-cache",
};

export function securityHeadersForProfile(profile: SecurityProfile): Record<string, string> {
  if (profile === "api") {
    return { ...API_HEADERS };
  }
  const csp = profile === "lab" ? LAB_CSP : PAGE_CSP;
  return {
    ...BASE_HEADERS,
    "Content-Security-Policy": csp,
  };
}

export function applySecurityHeaders(
  response: NextResponse,
  profile: SecurityProfile,
): NextResponse {
  const headers = securityHeadersForProfile(profile);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export function isNexusLabPagePath(pathname: string): boolean {
  return (
    pathname.includes("/dashboard/nexus-lab") ||
    pathname.includes("/dashboard/laboratorio") ||
    pathname.includes("/dashboard/gemini-lab") ||
    pathname.includes("/dashboard/live-operations-map")
  );
}

export function isNexusLabApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/nexus/lab");
}
