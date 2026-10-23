import { NextRequest, NextResponse } from "next/server";

import { onPaymentConfirmed } from "@/lib/payments/post-checkout";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret || !key) {
    return NextResponse.json({ ok: false, error: "stripe_webhook_not_configured" }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  const raw = await request.text();
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const plan = (s.metadata?.plan_tier ?? "standard").toLowerCase();
    const customer = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
    await onPaymentConfirmed({
      provider: "stripe",
      planId: plan,
      customerRef: customer,
      amountMinor: s.amount_total ?? null,
      currency: s.currency?.toUpperCase() ?? null,
    });
  }

  return NextResponse.json({ received: true });
}
