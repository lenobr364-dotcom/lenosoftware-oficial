import { CheckoutSuccessClient } from "@/app/components/checkout/CheckoutSuccessClient";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CheckoutSuccess" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const provider = typeof sp.provider === "string" ? sp.provider : "";
  const orderId = typeof sp.order_id === "string" ? sp.order_id.trim() : "";
  if (provider === "paypal" && orderId) {
    return <CheckoutSuccessClient locale={locale} sessionId={orderId} provider="paypal" />;
  }

  const sessionId = typeof sp.session_id === "string" ? sp.session_id.trim() : "";
  if (!sessionId) {
    redirect(`/${locale}/pricing`);
  }

  return <CheckoutSuccessClient locale={locale} sessionId={sessionId} />;
}
