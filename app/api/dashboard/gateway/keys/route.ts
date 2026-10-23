import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { createApiKey, listApiKeysForSubject } from "@/lib/gateway/api-key-store";
import type { ApiKeyScope } from "@/lib/gateway/types";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const createBodySchema = z.object({
  label: z.string().min(1).max(120),
  scopes: z
    .array(
      z.enum([
        "read:health",
        "read:openapi",
        "read:formulas",
        "read:analytics",
        "read:licensing",
      ]),
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const keys = await listApiKeysForSubject(guard.actorSubject);
  const res = NextResponse.json({ ok: true, keys });
  return applySecurityHeaders(res, "api");
}

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

  const parsed = createBodySchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const active = (await listApiKeysForSubject(guard.actorSubject)).filter((k) => k.status === "active");
  if (active.length >= 12) {
    const res = NextResponse.json({ ok: false, error: "active_key_limit" }, { status: 409 });
    return applySecurityHeaders(res, "api");
  }

  const created = await createApiKey(
    guard.actorSubject,
    parsed.data.label,
    parsed.data.scopes as ApiKeyScope[] | undefined,
  );

  recordAuditEvent({
    category: "api_key_minted",
    severity: "warning",
    outcome: "success",
    actorSubject: guard.actorSubject,
    resource: created.key.id,
    messageKey: "eventApiKeyMinted",
    messageParams: { label: parsed.data.label, keyPrefix: created.key.prefix },
    requestPath: "/api/dashboard/gateway/keys",
    ip: clientIpHint(request),
  });

  const res = NextResponse.json({ ok: true, ...created });
  return applySecurityHeaders(res, "api");
}
