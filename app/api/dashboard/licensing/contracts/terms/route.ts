import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import {
  getContractTerms,
  runContractSignatureAction,
} from "@/lib/services/licensing-contracts.service";
import { applySecurityHeaders } from "@/lib/security/http-security";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  contractId: z.string().min(1),
  kind: z.enum(["industrial_grant", "license_request"]),
  locale: z.string().optional(),
});

/** GET — termos de uso para um contrato (e avança fluxo para terms_generated). */
export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  const parsed = querySchema.safeParse({
    contractId: request.nextUrl.searchParams.get("contractId"),
    kind: request.nextUrl.searchParams.get("kind"),
    locale: request.nextUrl.searchParams.get("locale") ?? undefined,
  });

  if (!parsed.success) {
    const res = NextResponse.json({ error: "validation_error" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const { contractId, kind, locale } = parsed.data;
  const uiLocale = locale ?? "en";

  try {
    const terms = await getContractTerms(contractId, kind, uiLocale);
    const signature = await runContractSignatureAction({
      contractId,
      kind,
      action: "generate_terms",
    });
    const res = NextResponse.json({ ok: true, terms, signature });
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "terms_failed";
    const res = NextResponse.json({ ok: false, error: message }, { status: 500 });
    return applySecurityHeaders(res, "api");
  }
}
