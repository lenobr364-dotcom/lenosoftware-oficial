import { NextRequest, NextResponse } from "next/server";

import { normalizeStripeCardErrorCode } from "@/lib/pricing/checkout-error-messages";
import { PLAN_USD_MONTHLY, type PlanTierId } from "@/lib/pricing/plans";
import { convertUsdTo } from "@/lib/pricing/fx-usd";
import { checkoutPlanBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";
import Stripe from "stripe";

export const runtime = "nodejs";

function amountMinor(plan: PlanTierId, currency: "usd" | "eur" | "brl"): number {
  const usd = PLAN_USD_MONTHLY[plan];
  if (currency === "usd") return Math.round(usd * 100);
  const code = currency === "brl" ? "BRL" : "EUR";
  const conv = convertUsdTo(usd, code);
  return Math.round(conv * 100);
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = checkoutPlanBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  if (!secret) {
    return NextResponse.json({ ok: false, configured: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const cur = (parsed.data.currency ?? "USD").toLowerCase() as "usd" | "eur" | "brl";
  const plan = parsed.data.plan;
  const uiLocale = parsed.data.locale ?? "en";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: cur,
            unit_amount: amountMinor(plan, cur),
            recurring: { interval: "month" },
            product_data: {
              name: `ChemVault · ${plan}`,
              metadata: { plan_tier: plan },
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/${uiLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${uiLocale}/pricing?checkout=cancel`,
      metadata: { plan_tier: plan },
    });
    return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (e: unknown) {
    if (e instanceof Stripe.errors.StripeCardError) {
      const code = normalizeStripeCardErrorCode(e.code);
      return NextResponse.json({ ok: false, error: code }, { status: 402 });
    }
    if (e instanceof Stripe.errors.StripeRateLimitError) {
      return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
    }
    if (e instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json({ ok: false, error: "stripe_invalid_request" }, { status: 400 });
    }
    if (e instanceof Stripe.errors.StripeAuthenticationError) {
      return NextResponse.json({ ok: false, error: "stripe_auth_failed" }, { status: 502 });
    }
    if (e instanceof Stripe.errors.StripeAPIError) {
      return NextResponse.json({ ok: false, error: "stripe_api_error" }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: "stripe_checkout_failed" }, { status: 502 });
  }
}
