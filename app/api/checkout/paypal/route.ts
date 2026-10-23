import { NextRequest, NextResponse } from "next/server";

import { PLAN_USD_MONTHLY } from "@/lib/pricing/plans";
import { convertUsdTo } from "@/lib/pricing/fx-usd";
import { checkoutPlanBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

/**
 * Stub de ordem PayPal — substituir por OAuth + Orders v2 quando
 * `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` e URL de API estiverem definidos.
 */
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = checkoutPlanBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, configured: false, error: "paypal_not_configured" }, { status: 503 });
  }

  const plan = parsed.data.plan;
  const currency = (parsed.data.currency ?? "USD").toUpperCase();
  const usd = PLAN_USD_MONTHLY[plan];
  const amount =
    currency === "USD" ? usd : currency === "BRL" ? convertUsdTo(usd, "BRL") : convertUsdTo(usd, "EUR");

  return NextResponse.json({
    ok: true,
    stub: true,
    plan,
    currency,
    value: Number(amount.toFixed(2)),
    approvalUrl: null,
    message:
      "PayPal Orders API wiring pending — use this endpoint body shape from PricingPageClient; approvalUrl will be returned once integrated.",
  });
}
