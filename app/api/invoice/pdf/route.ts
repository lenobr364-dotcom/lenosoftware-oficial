import { NextRequest, NextResponse } from "next/server";

import { buildCheckoutInvoicePdf } from "@/lib/invoice/build-checkout-invoice-pdf";
import type { PlanTierId } from "@/lib/pricing/plans";
import Stripe from "stripe";

export const runtime = "nodejs";

function planLabel(plan: string): string {
  const p = plan.toLowerCase() as PlanTierId;
  if (p === "standard" || p === "enterprise" || p === "global") {
    return p.charAt(0).toUpperCase() + p.slice(1);
  }
  return plan;
}

function formatMinor(amount: number | null, currency: string | null): string {
  if (amount == null || !currency) return "—";
  const major = amount / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(major);
  } catch {
    return `${major} ${currency.toUpperCase()}`;
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")?.trim();
  if (!sessionId || sessionId.length > 256) {
    return NextResponse.json({ ok: false, error: "session_id_required" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "stripe_not_configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 404 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false, error: "payment_not_completed" }, { status: 409 });
  }

  const planTier = (session.metadata?.plan_tier ?? "standard").toLowerCase();
  const planKey = planTier as PlanTierId;
  const planLabelStr = planLabel(planTier);
  const cur = (session.currency ?? "usd").toUpperCase();
  const formatted =
    session.amount_total != null ? formatMinor(session.amount_total, session.currency) : formatMinor(null, null);

  const invoiceNumber = `CV-${session.id.slice(-12).toUpperCase()}`;
  const issuedAtIso = new Date().toISOString().replace("T", " ").slice(0, 19);

  const pdf = buildCheckoutInvoicePdf({
    invoiceNumber,
    issuedAtIso,
    planLabel: `${planLabelStr} (ChemVault · ${planKey})`,
    amountFormatted: formatted,
    currencyCode: cur,
    stripeSessionId: session.id,
  });

  const filename = `chemvault-invoice-${invoiceNumber}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
