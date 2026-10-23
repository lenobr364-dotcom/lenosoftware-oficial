/** Códigos devolvidos por `/api/checkout/stripe` e `/api/checkout/paypal` (e erros de rede no cliente). */
const PRICING_CHECKOUT_ERROR_CODES = new Set([
  "connection_failed",
  "stripe_not_configured",
  "paypal_not_configured",
  "invalid_json",
  "stripe_checkout_failed",
  "stripe_invalid_request",
  "stripe_api_error",
  "stripe_auth_failed",
  "rate_limit",
  "validation_error",
  "card_declined",
  "expired_card",
  "incorrect_cvc",
  "insufficient_funds",
  "processing_error",
  "authentication_required",
  "generic_card_error",
]);

const STRIPE_CARD_ERROR_WHITELIST = new Set([
  "card_declined",
  "expired_card",
  "incorrect_cvc",
  "insufficient_funds",
  "processing_error",
  "authentication_required",
]);

export function normalizeStripeCardErrorCode(code: string | undefined): string {
  if (code && STRIPE_CARD_ERROR_WHITELIST.has(code)) return code;
  return "generic_card_error";
}

export function pricingCheckoutErrorMessage(t: (key: string) => string, code?: string | null): string {
  const c = typeof code === "string" && code.length > 0 ? code : null;
  if (c && PRICING_CHECKOUT_ERROR_CODES.has(c)) {
    return t(`checkoutErrors.${c}`);
  }
  return t("checkoutErrors.generic");
}
