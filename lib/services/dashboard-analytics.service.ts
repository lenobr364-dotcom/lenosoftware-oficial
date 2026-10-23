import { cachedQuery } from "@/lib/db/performance";
import { buildAnalyticsMetricsPayload } from "@/lib/analytics/dashboard-metrics.builder";
import type { AnalyticsMetricsPayload } from "@/lib/analytics/types";

export async function getDashboardAnalyticsMetrics(
  locale?: string | null,
): Promise<AnalyticsMetricsPayload> {
  const key = `analytics-metrics-v1:${locale ?? "en"}`;
  const { data } = await cachedQuery(key, 15_000, () => buildAnalyticsMetricsPayload(locale));
  return data;
}
