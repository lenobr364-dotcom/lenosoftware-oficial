import { SecuritySeverity } from "@prisma/client";

import { recordSecurityEvent } from "@/lib/telemetry-db";

/**
 * Hook central quando um webhook Stripe/PayPal confirma pagamento.
 * Ligar aqui: emissão de licença, `mintCoreLicenseSession`, e-mail Resend, etc.
 */
export async function onPaymentConfirmed(input: {
  provider: "stripe" | "paypal";
  planId: string;
  customerRef: string | null;
  amountMinor?: number | null;
  currency?: string | null;
}): Promise<void> {
  await recordSecurityEvent({
    type: "payment_confirmed",
    severity: SecuritySeverity.INFO,
    title: `Checkout confirmed (${input.provider})`,
    detail: JSON.stringify({
      planId: input.planId,
      customerRef: input.customerRef,
      amountMinor: input.amountMinor ?? null,
      currency: input.currency ?? null,
    }),
    requestPath: `/webhooks/${input.provider}`,
    requestId: null,
    ip: null,
    userAgent: null,
    region: null,
  });
}
