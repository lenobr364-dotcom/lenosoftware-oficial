import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { revokeApiKey } from "@/lib/gateway/api-key-store";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  keyId: z.string().min(8).max(64),
});

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const key = await revokeApiKey(parsed.data.keyId, guard.actorSubject);
  if (!key) {
    const res = NextResponse.json({ ok: false, error: "key_not_found" }, { status: 404 });
    return applySecurityHeaders(res, "api");
  }

  recordAuditEvent({
    category: "api_key_revoked",
    severity: "warning",
    outcome: "success",
    actorSubject: guard.actorSubject,
    resource: key.id,
    messageKey: "eventApiKeyRevoked",
    messageParams: { keyPrefix: key.prefix },
    requestPath: "/api/dashboard/gateway/keys/revoke",
    ip: clientIpHint(request),
  });

  const res = NextResponse.json({ ok: true, key });
  return applySecurityHeaders(res, "api");
}
