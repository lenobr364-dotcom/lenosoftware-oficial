import { localeTagForFormat } from "@/lib/market-scalability-fx";

export function formatAnalyticsMoney(amount: number, locale: string, currency: string): string {
  return new Intl.NumberFormat(localeTagForFormat(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
