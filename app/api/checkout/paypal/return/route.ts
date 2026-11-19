import { NextRequest, NextResponse } from "next/server";

import { capturePayPalOrder, isPayPalCheckoutEnabled } from "@/lib/pricing/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCALES = new Set(["en", "de", "pt", "hi", "ar"]);

export async function GET(request: NextRequest) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "en";
  const locale = LOCALES.has(localeParam) ? localeParam : "en";
  const pricingUrl = `${baseUrl}/${locale}/pricing?checkout=cancel`;

  if (!isPayPalCheckoutEnabled()) {
    return NextResponse.redirect(pricingUrl);
  }

  const orderId = request.nextUrl.searchParams.get("token")?.trim();
  if (!orderId) {
    return NextResponse.redirect(pricingUrl);
  }

  try {
    await capturePayPalOrder(orderId);
  } catch {
    return NextResponse.redirect(pricingUrl);
  }

  const success = new URL(`${baseUrl}/${locale}/checkout/success`);
  success.searchParams.set("provider", "paypal");
  success.searchParams.set("order_id", orderId);
  return NextResponse.redirect(success);
}
