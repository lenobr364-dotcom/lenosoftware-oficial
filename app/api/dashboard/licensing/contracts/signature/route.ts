import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { runContractSignatureAction } from "@/lib/services/licensing-contracts.service";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  contractId: z.string().min(1),
  kind: z.enum(["industrial_grant", "license_request"]),
  action: z.enum(["send_for_signature", "mark_signed", "anchor_chain"]),
  signerEmail: z.string().email().optional(),
  hasChainAnchor: z.boolean().optional(),
});

/** POST — avança fluxo de assinatura digital simulado. */
export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    const res = NextResponse.json({ error: "invalid_json" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const res = NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  try {
    const signature = await runContractSignatureAction(parsed.data);
    const res = NextResponse.json({ ok: true, signature });
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "signature_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
