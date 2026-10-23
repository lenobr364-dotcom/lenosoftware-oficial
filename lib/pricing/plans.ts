export type PlanTierId = "standard" | "enterprise" | "global";

export type PricingCurrency = "USD" | "EUR" | "BRL";

/** Preços-base mensais em USD (âncora comercial). */
export const PLAN_USD_MONTHLY: Record<PlanTierId, number> = {
  standard: 499,
  enterprise: 1499,
  global: 3999,
};

export function planIds(): PlanTierId[] {
  return ["standard", "enterprise", "global"];
}
