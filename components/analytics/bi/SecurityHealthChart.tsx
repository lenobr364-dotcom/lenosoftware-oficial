"use client";

import { GlassChartShell, glassTooltipStyle } from "@/components/analytics/GlassChartShell";
import type { BusinessIntelligencePayload } from "@/lib/analytics/types";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS: Record<BusinessIntelligencePayload["securityHealth"]["statusKey"], string> = {
  excellent: "#34d399",
  good: "#22d3ee",
  caution: "#fbbf24",
  critical: "#f43f5e",
};

type SecurityHealthChartProps = {
  health: BusinessIntelligencePayload["securityHealth"];
};

export function SecurityHealthChart({ health }: SecurityHealthChartProps) {
  const t = useTranslations("AnalyticsMetrics");

  const ringData = [
    { name: "score", value: health.score },
    { name: "gap", value: 100 - health.score },
  ];

  const mixData = [
    { name: t("biSeverityInfo"), value: health.info, fill: "#34d399" },
    { name: t("biSeverityWarning"), value: health.warning, fill: "#fbbf24" },
    { name: t("biSeverityCritical"), value: health.critical, fill: "#f43f5e" },
  ].filter((d) => d.value > 0);

  const accent = health.statusKey === "critical" ? "gold" : health.statusKey === "caution" ? "gold" : "emerald";

  return (
    <GlassChartShell
      eyebrow={t("biSecurityEyebrow")}
      title={t("biSecurityTitle")}
      subtitle={t(`biSecurityStatus_${health.statusKey}`)}
      ariaLabel={t("biSecurityAria")}
      accent={accent}
      heightClass="h-[min(18rem,50vw)] md:h-80"
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 pb-2 md:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ringData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="88%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                <Cell fill={STATUS_COLORS[health.statusKey]} />
                <Cell fill="rgba(255,255,255,0.06)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-white">{health.score}</p>
            <p className="text-[0.62rem] uppercase tracking-wider text-white/45">{t("biSecurityScoreLabel")}</p>
          </div>
        </div>
        <div className="w-full max-w-xs flex-1 space-y-2">
          {mixData.length === 0 ? (
            <p className="text-center text-sm text-white/40">{t("biSecurityEmpty")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={mixData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={58}
                  stroke="rgba(255,255,255,0.08)"
                  isAnimationActive={false}
                >
                  {mixData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={glassTooltipStyle()} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <ul className="grid grid-cols-3 gap-2 text-center text-[0.62rem] uppercase tracking-wide text-white/50">
            <li>
              <span className="block text-lg font-semibold text-emerald-300">{health.info}</span>
              {t("biSeverityInfo")}
            </li>
            <li>
              <span className="block text-lg font-semibold text-amber-300">{health.warning}</span>
              {t("biSeverityWarning")}
            </li>
            <li>
              <span className="block text-lg font-semibold text-rose-300">{health.critical}</span>
              {t("biSeverityCritical")}
            </li>
          </ul>
        </div>
      </div>
    </GlassChartShell>
  );
}

