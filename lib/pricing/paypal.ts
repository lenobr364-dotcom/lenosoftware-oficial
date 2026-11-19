import "server-only";

import { PLAN_USD_MONTHLY, type PlanTierId } from "@/lib/pricing/plans";
import { convertUsdTo } from "@/lib/pricing/fx-usd";

export type PayPalCurrency = "USD" | "EUR" | "BRL";

export function isPayPalCheckoutEnabled(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

function paypalApiBase(): string {
  const explicit = process.env.PAYPAL_API_BASE?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return process.env.PAYPAL_ENV?.trim().toLowerCase() === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

function orderAmount(plan: PlanTierId, currency: PayPalCurrency): string {
  const usd = PLAN_USD_MONTHLY[plan];
  const major = currency === "USD" ? usd : convertUsdTo(usd, currency);
  return major.toFixed(2);
}

async function paypalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) {
    throw new Error("paypal_auth_failed");
  }
  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("paypal_auth_failed");
  return json.access_token;
}

export async function createPayPalCheckoutOrder(input: {
  plan: PlanTierId;
  currency: PayPalCurrency;
  locale: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const token = await paypalAccessToken();
  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.plan,
          amount: {
            currency_code: input.currency,
            value: orderAmount(input.plan, input.currency),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "ChemVault Global",
            user_action: "PAY_NOW",
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    }),
  });
  if (!response.ok) throw new Error("paypal_checkout_failed");
  const json = (await response.json()) as {
    links?: Array<{ rel?: string; href?: string }>;
  };
  const approval = json.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!approval) throw new Error("paypal_checkout_failed");
  return approval;
}

export async function capturePayPalOrder(orderId: string): Promise<void> {
  const token = await paypalAccessToken();
  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("paypal_checkout_failed");
}
