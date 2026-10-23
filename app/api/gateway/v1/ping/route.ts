import { NextRequest, NextResponse } from "next/server";

import {
  authenticateGatewayApiKey,
  gatewayForbidden,
  gatewayUnauthorized,
  recordGatewayAccess,
  requireScope,
} from "@/lib/gateway/api-key-auth";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { checkLabApiRateLimit, rateLimitHeaders } from "@/lib/security/api-rate-limit";

export const dynamic = "force-dynamic";

/** High-performance health probe for licensed integrators (Bearer API key). */
export async function GET(request: NextRequest) {
  const started = Date.now();
  const rl = checkLabApiRateLimit(request, "gateway", 180);
  if (!rl.allowed) {
    const res = NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
    return applySecurityHeaders(res, "api");
  }

  const ctx = await authenticateGatewayApiKey(request);
  if (!ctx) {
    return applySecurityHeaders(gatewayUnauthorized(), "api");
  }
  if (!requireScope(ctx, "read:health")) {
    return applySecurityHeaders(gatewayForbidden("read:health"), "api");
  }

  const latencyMs = Date.now() - started;
  await recordGatewayAccess(request, ctx, 200, latencyMs);

  const res = NextResponse.json({
    ok: true,
    service: "chemvault-gateway",
    keyPrefix: ctx.key.prefix,
    latencyMs,
    at: new Date().toISOString(),
  });
  return applySecurityHeaders(res, "api");
}
