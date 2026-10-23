"use client";

import { DecryptVolumeChart } from "@/components/analytics/bi/DecryptVolumeChart";
import { EstimatedRevenueCard } from "@/components/analytics/bi/EstimatedRevenueCard";
import { SecurityHealthChart } from "@/components/analytics/bi/SecurityHealthChart";
import type { BusinessIntelligencePayload } from "@/lib/analytics/types";
import { useTranslations } from "next-intl";

type BusinessIntelligenceSectionProps = {
  data: BusinessIntelligencePayload | null;
  loading?: boolean;
};

const EMPTY_BI: BusinessIntelligencePayload = {
  estimatedRevenue: { total: 0, currency: "USD", licensesIssued: 0, unitAnnualDisplay: 0 },
  decryptVolume: { byDay: [], byHour: [], totalDecrypts: 0 },
  securityHealth: { score: 100, info: 0, warning: 0, critical: 0, statusKey: "excellent" },
};

export function BusinessIntelligenceSection({ data, loading }: BusinessIntelligenceSectionProps) {
  const t = useTranslations("AnalyticsMetrics");
  const bi = data ?? EMPTY_BI;

  return (
    <section className="space-y-4" aria-labelledby="bi-section-heading">
      <div>
        <p className="nx-type-eyebrow text-[0.6rem] text-violet-300/80">{t("biSectionEyebrow")}</p>
        <h2 id="bi-section-heading" className="mt-1 text-xl font-semibold text-white md:text-2xl">
          {t("biSectionTitle")}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-white/45">{t("biSectionSubtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <EstimatedRevenueCard data={bi.estimatedRevenue} loading={loading} />
        <div className="lg:col-span-2">
          <DecryptVolumeChart volume={bi.decryptVolume} />
        </div>
        <div className="lg:col-span-3">
          <SecurityHealthChart health={bi.securityHealth} />
        </div>
      </div>
    </section>
  );
}

