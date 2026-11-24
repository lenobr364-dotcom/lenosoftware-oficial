import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { getExclusivityTerms } from "@/lib/anti-disintermediation/exclusivity-terms";
import { getPixBillingConfig } from "@/lib/comercial/plans";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      terms: getExclusivityTerms(),
      billing: getPixBillingConfig(),
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_terms_failed",
      message: "Falha ao carregar termos.",
      scope: "comercial.terms.GET",
      cause,
    });
  }
}
