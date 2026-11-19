import { NextRequest, NextResponse } from "next/server";

import { createPayPalCheckoutOrder, isPayPalCheckoutEnabled, type PayPalCurrency } from "@/lib/pricing/paypal";
import { checkoutPlanBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isPayPalCheckoutEnabled()) {
    return NextResponse.json({ ok: false, configured: false, error: "paypal_not_configured" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = checkoutPlanBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const locale = parsed.data.locale ?? "en";
  const currency = (parsed.data.currency ?? "USD").toUpperCase() as PayPalCurrency;

  try {
    const url = await createPayPalCheckoutOrder({
      plan: parsed.data.plan,
      currency,
      locale,
      returnUrl: `${baseUrl}/api/checkout/paypal/return?locale=${encodeURIComponent(locale)}`,
      cancelUrl: `${baseUrl}/${locale}/pricing?checkout=cancel`,
    });
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: false, error: "paypal_checkout_failed" }, { status: 502 });
  }
}
