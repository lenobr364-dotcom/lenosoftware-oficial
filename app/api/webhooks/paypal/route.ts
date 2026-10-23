import { NextRequest, NextResponse } from "next/server";

import { onPaymentConfirmed } from "@/lib/payments/post-checkout";

export const runtime = "nodejs";

/**
 * Webhook PayPal (CHECKOUT.ORDER.APPROVED / PAYMENT.CAPTURE.COMPLETED).
 * Validar `PAYPAL_WEBHOOK_ID` + assinatura conforme doc PayPal; aqui aceitamos
 * apenas presença de cabeçalhos mínimos em sandbox para não bloquear integração futura.
 */
export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    return NextResponse.json({ ok: false, error: "paypal_webhook_not_configured" }, { status: 503 });
  }

  const transmissionId = request.headers.get("paypal-transmission-id");
  if (!transmissionId) {
    return NextResponse.json({ ok: false, error: "missing_paypal_headers" }, { status: 400 });
  }

  let body: { event_type?: string; resource?: { id?: string; custom_id?: string } };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const type = body.event_type ?? "";
  if (type.includes("PAYMENT.CAPTURE.COMPLETED") || type.includes("CHECKOUT.ORDER.APPROVED")) {
    const plan = body.resource?.custom_id?.split(":")[1] ?? "standard";
    await onPaymentConfirmed({
      provider: "paypal",
      planId: plan,
      customerRef: body.resource?.id ?? null,
      amountMinor: null,
      currency: null,
    });
  }

  return NextResponse.json({ received: true });
}
