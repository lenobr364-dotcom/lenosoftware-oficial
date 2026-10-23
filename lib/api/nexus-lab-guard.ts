import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense, type CeoCoreGuardOk } from "@/lib/api-dashboard-write-guard";
import { verifyHqLabToken, HQ_LAB_COOKIE } from "@/lib/lab/hq-access";
import { requireLabAgentSecretOnly } from "@/lib/lab-intelligence-agent-auth";
import { checkLabApiRateLimit, rateLimitHeaders } from "@/lib/security/api-rate-limit";
import { applySecurityHeaders } from "@/lib/security/http-security";
import type { CacheProfile } from "@/lib/http/cache-policy";
import { cacheControlHeader } from "@/lib/http/cache-policy";

export type NexusLabAccess =
  | ({ mode: "ceo" } & CeoCoreGuardOk)
  | { mode: "agent"; actorSubject: string };

function rateLimitedResponse(request: NextRequest): NextResponse | null {
  const rl = checkLabApiRateLimit(request, "nexus-lab");
  if (rl.allowed) return null;
  const res = NextResponse.json(
    { ok: false, error: "rate_limited" },
    { status: 429, headers: rateLimitHeaders(rl) },
  );
  return applySecurityHeaders(res, "api");
}

/**
 * APIs do laboratório NEXUS: rate limit + (agente Bearer OU CEO+core+atestação QG).
 */
export async function requireNexusLabApiAccess(
  request: NextRequest,
  options?: { allowAgentOnly?: boolean },
): Promise<NexusLabAccess | NextResponse> {
  const limited = rateLimitedResponse(request);
  if (limited) return limited;

  if (options?.allowAgentOnly) {
    const agentOnly = requireLabAgentSecretOnly(request);
    if (!(agentOnly instanceof NextResponse)) {
      return { mode: "agent", actorSubject: "lab-agent:bearer" };
    }
  }

  const agentHeader = request.headers.get("authorization") ?? "";
  const hasBearer = agentHeader.toLowerCase().startsWith("bearer ");
  if (hasBearer && process.env.CHEMVAULT_LAB_AGENT_SECRET?.trim()) {
    const agent = requireLabAgentSecretOnly(request);
    if (agent instanceof NextResponse) return applySecurityHeaders(agent, "api");
    return { mode: "agent", actorSubject: "lab-agent:bearer" };
  }

  const ceo = await requireCeoAndCoreLicense(request);
  if (ceo instanceof NextResponse) return applySecurityHeaders(ceo, "api");

  const hq = request.cookies.get(HQ_LAB_COOKIE)?.value;
  if (!(await verifyHqLabToken(hq))) {
    const res = NextResponse.json(
      {
        ok: false,
        error: "hq_attestation_required",
        message: "POST /api/nexus/lab/hq/attest with valid CEO session to access HQ lab APIs.",
      },
      { status: 403 },
    );
    return applySecurityHeaders(res, "api");
  }

  return { mode: "ceo", ...ceo };
}

export function nexusLabJsonResponse(
  body: unknown,
  init?: { status?: number; cache?: CacheProfile },
): NextResponse {
  const headers: Record<string, string> = {};
  if (init?.cache) {
    headers["Cache-Control"] = cacheControlHeader(init.cache);
  }
  const res = NextResponse.json(body, { status: init?.status ?? 200, headers });
  return applySecurityHeaders(res, "api");
}
