import createMiddleware from "next-intl/middleware";

import { type NextRequest, NextResponse } from "next/server";



import { CORE_LICENSE_COOKIE, verifyCoreLicenseSession } from "./lib/core-license-session";

import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "./lib/ceo-session";

import { HQ_LAB_COOKIE, verifyHqLabToken } from "./lib/lab/hq-access";

import { clientIpHint, inferRegionFromHeaders, userAgentHint } from "./lib/request-meta";

import { enqueueSecurityLog } from "./lib/security-edge-log";

import {

  applySecurityHeaders,

  isNexusLabApiPath,

  isNexusLabPagePath,

} from "./lib/security/http-security";

import { newRequestId } from "./lib/server-logger";

import { routing } from "./i18n/routing";



const intlMiddleware = createMiddleware(routing);



function withSecurity(response: NextResponse, request: NextRequest): NextResponse {

  const { pathname } = request.nextUrl;

  const profile = pathname.startsWith("/api/") ? "api" : isNexusLabPagePath(pathname) ? "lab" : "page";

  return applySecurityHeaders(response, profile);

}



/** APIs de visualização / uso de fórmulas: licença core validada a cada pedido (incl. expiração). */

function requiresLiveCoreLicenseApi(request: NextRequest): boolean {

  const pathname = request.nextUrl.pathname;

  if (pathname === "/api/client-access") return true;

  if (pathname === "/api/vault/formulas") return true;

  if (pathname === "/api/formulas" && request.method === "GET") return true;

  return false;

}



function coreLicenseDeniedResponse(requestId: string) {

  return NextResponse.json(

    {

      ok: false,

      error: "core_license_required",

      message:

        "Active ChemVault license session required. Authenticate via POST /api/auth (portal), POST /api/auth/ceo (dashboard), or POST /api/vault/unlock (formula vault).",

      requestId,

    },

    { status: 401 },

  );

}



function matchLocalizedDashboard(pathname: string): { locale: string } | null {

  for (const locale of routing.locales) {

    const prefix = `/${locale}/dashboard`;

    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {

      return { locale };

    }

  }

  return null;

}



function isLocalizedLogin(pathname: string): boolean {

  for (const locale of routing.locales) {

    if (pathname === `/${locale}/login`) {

      return true;

    }

  }

  return false;

}



/**
 * Ecossistema Lumen Lab — gate por cookies simples `role=CEO` + `license=core`
 * (emitidos por finalizeCeoLoginSession após login real). Cobre o Laboratório
 * Digital + os dois módulos do dashboard que o lab linka como destinos
 * operacionais. Retorna o locale detectado para preservar o idioma no redirect
 * ao /login.
 */

const LUMEN_LAB_SUBPATHS = ["/laboratorio", "/dashboard/chemical-vault", "/dashboard/formula-simulator"] as const;

function matchLumenLabRoute(pathname: string): { locale: string } | null {

  for (const locale of routing.locales) {

    for (const sub of LUMEN_LAB_SUBPATHS) {

      const base = `/${locale}${sub}`;

      if (pathname === base || pathname.startsWith(`${base}/`)) {

        return { locale };

      }

    }

  }

  return null;

}



function shouldForceHttps(request: NextRequest): boolean {

  if (process.env.NODE_ENV !== "production") return false;

  if (process.env.CHEMVAULT_DISABLE_HTTPS_REDIRECT === "1") return false;

  const host = (request.headers.get("host") ?? "").split(":")[0] ?? "";

  if (!host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;

  const proto = request.headers.get("x-forwarded-proto");

  if (!proto) return false;

  return proto === "http";

}



function isLabAgentBearerRequest(request: NextRequest): boolean {

  const auth = request.headers.get("authorization") ?? "";

  if (!auth.toLowerCase().startsWith("bearer ")) return false;

  return Boolean(process.env.CHEMVAULT_LAB_AGENT_SECRET?.trim());

}



async function requireHqForNexusLabApi(request: NextRequest): Promise<NextResponse | null> {

  if (!isNexusLabApiPath(request.nextUrl.pathname)) return null;

  if (request.nextUrl.pathname === "/api/nexus/lab/hq/attest") return null;

  if (request.nextUrl.pathname.endsWith("/automation/tick") && isLabAgentBearerRequest(request)) {

    return null;

  }

  if (isLabAgentBearerRequest(request)) return null;



  const hq = request.cookies.get(HQ_LAB_COOKIE)?.value;

  if (await verifyHqLabToken(hq)) return null;



  return NextResponse.json(

    {

      ok: false,

      error: "hq_attestation_required",

      message: "HQ lab attestation required. POST /api/nexus/lab/hq/attest after CEO login.",

    },

    { status: 403 },

  );

}



export default async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;



  if (shouldForceHttps(request)) {

    const url = request.nextUrl.clone();

    url.protocol = "https:";

    return withSecurity(NextResponse.redirect(url, 308), request);

  }



  if (pathname.startsWith("/api/")) {

    const hqBlock = await requireHqForNexusLabApi(request);

    if (hqBlock) return withSecurity(hqBlock, request);



    if (requiresLiveCoreLicenseApi(request)) {

      const requestId = newRequestId();

      const core = request.cookies.get(CORE_LICENSE_COOKIE)?.value;

      if (!(await verifyCoreLicenseSession(core))) {

        enqueueSecurityLog(request.nextUrl.origin, {

          type: "core_license_denied",

          severity: "CRITICAL",

          title: "Protected ChemVault API blocked — missing or expired core license session",

          detail: `${request.method} ${pathname}`,

          requestPath: pathname,

          requestId,

          region: inferRegionFromHeaders(request),

          ip: clientIpHint(request) ?? undefined,

          userAgent: userAgentHint(request) ?? undefined,

        });

        return withSecurity(coreLicenseDeniedResponse(requestId), request);

      }

    }

    return withSecurity(NextResponse.next(), request);

  }



  if (isLocalizedLogin(pathname)) {

    return withSecurity(intlMiddleware(request), request);

  }



  // Gate do ecossistema Lumen Lab (/laboratorio, /dashboard/chemical-vault,
  // /dashboard/formula-simulator): exige cookies `role=CEO` + `license=core`
  // setados por POST /api/auth/login → finalizeCeoLoginSession após validação.
  // Runs antes do gate HMAC do dashboard para essas 3 rotas.

  const lumenLab = matchLumenLabRoute(pathname);

  if (lumenLab) {

    const role = request.cookies.get("role")?.value;

    const license = request.cookies.get("license")?.value;

    if (role !== "CEO" || license !== "core") {

      const url = request.nextUrl.clone();

      url.pathname = `/${lumenLab.locale}/login`;

      url.search = "";

      url.searchParams.set("auth_failed", "true");

      return withSecurity(NextResponse.redirect(url), request);

    }

    return withSecurity(intlMiddleware(request), request);

  }



  const localizedDashboard = matchLocalizedDashboard(pathname);

  if (localizedDashboard) {

    const ceo = request.cookies.get(CEO_SESSION_COOKIE)?.value;

    if (!(await verifyCeoSessionToken(ceo))) {

      const url = request.nextUrl.clone();

      url.pathname = `/${localizedDashboard.locale}/login`;

      url.search = "";

      return withSecurity(NextResponse.redirect(url), request);

    }

    const core = request.cookies.get(CORE_LICENSE_COOKIE)?.value;

    if (!(await verifyCoreLicenseSession(core))) {

      const url = request.nextUrl.clone();

      url.pathname = `/${localizedDashboard.locale}/login`;

      url.search = "";

      return withSecurity(NextResponse.redirect(url), request);

    }

    return withSecurity(intlMiddleware(request), request);

  }



  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {

    const ceo = request.cookies.get(CEO_SESSION_COOKIE)?.value;

    if (!(await verifyCeoSessionToken(ceo))) {

      const url = request.nextUrl.clone();

      url.pathname = `/${routing.defaultLocale}/login`;

      url.search = "";

      return withSecurity(NextResponse.redirect(url), request);

    }

    const core = request.cookies.get(CORE_LICENSE_COOKIE)?.value;

    if (!(await verifyCoreLicenseSession(core))) {

      const url = request.nextUrl.clone();

      url.pathname = `/${routing.defaultLocale}/login`;

      url.search = "";

      return withSecurity(NextResponse.redirect(url), request);

    }

    return withSecurity(intlMiddleware(request), request);

  }



  return withSecurity(intlMiddleware(request), request);

}



export const config = {

  matcher: ["/((?!_next|.*\\..*).*)"],

};


