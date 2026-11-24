import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { getPixBillingConfig } from "@/lib/comercial/plans";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, billing: getPixBillingConfig() });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_plans_failed",
      message: "Falha ao carregar planos comerciais.",
      scope: "comercial.plans.GET",
      cause,
    });
  }
}
