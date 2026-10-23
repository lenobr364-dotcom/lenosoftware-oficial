import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { appendAccessLog } from "@/lib/gateway/access-log-store";
import { parseApiKey, verifyApiKeySecret } from "@/lib/gateway/api-key-crypto";
import { findApiKeyById, getActiveKeyRecord, touchApiKeyUsage } from "@/lib/gateway/api-key-store";
import type { ApiKeyRecord, ApiKeyScope } from "@/lib/gateway/types";
import { clientIpHint } from "@/lib/request-meta";

export type GatewayAuthContext = {
  key: ApiKeyRecord;
  scopes: ApiKeyScope[];
};

function extractBearer(request: NextRequest): string | null {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function authenticateGatewayApiKey(
  request: NextRequest,
): Promise<GatewayAuthContext | null> {
  const raw = extractBearer(request);
  if (!raw) return null;
  const parsed = parseApiKey(raw);
  if (!parsed) return null;
  const record = await getActiveKeyRecord(parsed.keyId);
  if (!record) return null;
  if (!verifyApiKeySecret(parsed.secret, record.secretHash)) return null;
  return { key: record, scopes: record.scopes };
}

export function requireScope(ctx: GatewayAuthContext, scope: ApiKeyScope): boolean {
  return ctx.scopes.includes(scope);
}

export async function recordGatewayAccess(
  request: NextRequest,
  ctx: GatewayAuthContext,
  status: number,
  latencyMs: number,
): Promise<void> {
  await touchApiKeyUsage(ctx.key.id);
  await appendAccessLog({
    keyId: ctx.key.id,
    keyPrefix: ctx.key.prefix,
    method: request.method,
    path: request.nextUrl.pathname,
    status,
    latencyMs,
    ipHint: maskIp(clientIpHint(request) ?? "unknown"),
  });
}

function maskIp(ip: string): string {
  if (!ip || ip === "unknown") return "—";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (ip.includes(":")) return `${ip.slice(0, 8)}…`;
  return "masked";
}

export function gatewayUnauthorized(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "gateway_api_key_required" },
    { status: 401 },
  );
}

export function gatewayForbidden(scope: ApiKeyScope): NextResponse {
  return NextResponse.json(
    { ok: false, error: "insufficient_scope", required: scope },
    { status: 403 },
  );
}

export async function resolveKeyForSubjectCheck(keyId: string, subject: string): Promise<boolean> {
  const row = await findApiKeyById(keyId);
  return row?.subject === subject;
}
