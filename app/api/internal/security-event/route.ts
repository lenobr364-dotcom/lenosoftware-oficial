import { SecuritySeverity } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { recordSecurityEvent } from "@/lib/telemetry-db";
import { internalSecurityEventBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const dynamic = "force-dynamic";

function parseSeverity(raw: string | undefined): SecuritySeverity {
  if (raw === "CRITICAL") return SecuritySeverity.CRITICAL;
  if (raw === "INFO") return SecuritySeverity.INFO;
  return SecuritySeverity.WARNING;
}

export async function POST(request: NextRequest) {
  const secret = process.env.CHEMVAULT_INTERNAL_LOG_SECRET?.trim();
  const provided = request.headers.get("x-chemvault-internal")?.trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = internalSecurityEventBodySchema.safeParse(raw);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const rec = parsed.data;
  await recordSecurityEvent({
    type: rec.type,
    severity: parseSeverity(rec.severity),
    title: rec.title,
    detail: rec.detail ?? null,
    requestPath: rec.requestPath ?? null,
    requestId: rec.requestId ?? null,
    ip: rec.ip,
    userAgent: rec.userAgent,
    region: rec.region,
  });

  return NextResponse.json({ ok: true });
}
