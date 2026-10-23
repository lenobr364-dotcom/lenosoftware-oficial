/**
 * Tipos — camada analítica do dashboard ChemVault Global.
 */

export type AnalyticsTimePoint = {
  day: string;
  value: number;
};

export type AnalyticsRegionalSlice = {
  regionKey: string;
  label: string;
  count: number;
};

export type AnalyticsRevenuePoint = {
  month: string;
  projected: number;
  actual?: number;
};

export type BiDecryptDayPoint = {
  day: string;
  decrypts: number;
};

export type BiHourlyPoint = {
  hour: number;
  label: string;
  value: number;
};

/** Pontos normalizados para gráficos Recharts (dia ou hora). */
export type BiDecryptChartPoint = {
  label: string;
  value: number;
};

export type BusinessIntelligencePayload = {
  estimatedRevenue: {
    total: number;
    currency: string;
    licensesIssued: number;
    unitAnnualDisplay: number;
  };
  decryptVolume: {
    byDay: BiDecryptDayPoint[];
    byHour: BiHourlyPoint[];
    totalDecrypts: number;
  };
  securityHealth: {
    score: number;
    info: number;
    warning: number;
    critical: number;
    statusKey: "excellent" | "good" | "caution" | "critical";
  };
};

export type AnalyticsMetricsPayload = {
  locale: string;
  currency: string;
  updatedAt: string;
  kpis: {
    activeLicenses: number;
    licensedFormulas: number;
    pendingRequests: number;
    growthRatePct: number;
  };
  activeLicenseTrend: AnalyticsTimePoint[];
  regionalDistribution: AnalyticsRegionalSlice[];
  revenueProjection: AnalyticsRevenuePoint[];
  businessIntelligence: BusinessIntelligencePayload;
};
