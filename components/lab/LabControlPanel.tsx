"use client";

import {
  GlassBadge,
  GlassButton,
  GlassHeading,
  GlassMetric,
  GlassModuleTile,
  GlassPanel,
  GlassSection,
} from "@/components/lab/design-system";
import { useLabDashboard } from "@/hooks/useLabDashboard";
import { useLabIntelligence } from "@/hooks/useLabIntelligence";
import { Link } from "@/i18n/navigation";
import { resolveLabRegionForLocale } from "@/lib/lab/international";
import {
  Activity,
  Bot,
  FlaskConical,
  Globe2,
  Map,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const REGION_LABEL_KEYS = {
  latam: "regionLatam",
  europe: "regionEurope",
  asia: "regionAsia",
  mena: "regionMena",
} as const;

export function LabControlPanel() {
  const t = useTranslations("NexusLab");
  const locale = useLocale();
  const { data, loading, error, refresh } = useLabDashboard();
  const intel = useLabIntelligence();
  const region = resolveLabRegionForLocale(locale);
  const regionLabelKey = REGION_LABEL_KEYS[region.id as keyof typeof REGION_LABEL_KEYS] ?? "regionLatam";

  const m = data?.metrics;

  const modules = [
    {
      title: t("moduleVaultTitle"),
      description: t("moduleVaultDesc"),
      href: "/dashboard",
      status: t("statusOnline"),
      icon: FlaskConical,
    },
    {
      title: t("moduleGeminiTitle"),
      description: t("moduleGeminiDesc"),
      href: "/dashboard/gemini-lab",
      status: t("statusActive"),
      icon: Sparkles,
    },
    {
      title: t("moduleLicensingTitle"),
      description: t("moduleLicensingDesc"),
      href: "/dashboard/licensing-contracts",
      status: t("statusSynced"),
      icon: Wallet,
    },
    {
      title: t("moduleGlobalTitle"),
      description: t("moduleGlobalDesc"),
      href: "/dashboard/market-scalability",
      status: t("statusActive"),
      icon: Globe2,
    },
    {
      title: t("moduleSecurityTitle"),
      description: t("moduleSecurityDesc"),
      href: "/dashboard/admin-monitor",
      status: t("statusShielded"),
      icon: Shield,
    },
    {
      title: t("moduleTelemetryTitle"),
      description: t("moduleTelemetryDesc"),
      href: "/dashboard/analytics",
      status: t("statusLive"),
      icon: Activity,
    },
    {
      title: t("moduleIntelligenceTitle"),
      description: t("moduleIntelligenceDesc"),
      href: "/dashboard/nexus-lab",
      status: intel.data?.agents.online ? t("statusActive") : t("statusOnline"),
      icon: Bot,
    },
    {
      title: t("moduleLiveMapTitle"),
      description: t("moduleLiveMapDesc"),
      href: "/dashboard/live-operations-map",
      status: t("statusLive"),
      icon: Map,
    },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 md:py-10">
      <GlassPanel variant="elevated" padding="lg" className="nx-glass-panel--floating mb-10 overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <GlassHeading level="display" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <GlassBadge tone="emerald" pulse>
                <Radio className="h-3 w-3" aria-hidden />
                {data?.headquarters ?? t("hqLabel", { city: "Barra do Garças", cep: "78600-412" })}
              </GlassBadge>
              <GlassBadge tone="violet">{t(regionLabelKey)}</GlassBadge>
              {data ? (
                <GlassBadge tone="mono">
                  {data.serverTime.local}
                </GlassBadge>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="nx-glass-nav-link inline-flex items-center gap-2 self-start sm:self-end"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {t("refreshData")}
            </button>
          </div>
        </div>
      </GlassPanel>

      {error ? (
        <GlassPanel padding="md" className="mb-6 border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-200/90">{t("dataError")}</p>
        </GlassPanel>
      ) : null}

      <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("metricsAria")}>
        <GlassMetric
          label={m ? t(m.formulas.labelKey) : t("metricFormulas")}
          value={loading ? "…" : (m?.formulas.value ?? "—")}
          hint={m ? t(m.formulas.hintKey) : t("metricFormulasHint")}
          trend={m?.formulas.trend ?? "neutral"}
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <GlassMetric
          label={m ? t(m.licensed.labelKey) : t("metricLicensed")}
          value={loading ? "…" : (m?.licensed.value ?? "—")}
          hint={m ? t(m.licensed.hintKey) : t("metricLicensedHint")}
          trend={m?.licensed.trend ?? "neutral"}
          icon={<Shield className="h-4 w-4" />}
        />
        <GlassMetric
          label={m ? t(m.activeLicenses.labelKey) : t("metricActiveLicenses")}
          value={loading ? "…" : (m?.activeLicenses.value ?? "—")}
          hint={m ? t(m.activeLicenses.hintKey) : t("metricActiveLicensesHint")}
          trend={m?.activeLicenses.trend ?? "up"}
          icon={<Wallet className="h-4 w-4" />}
        />
        <GlassMetric
          label={m ? t(m.pipeline.labelKey) : t("metricPipeline")}
          value={loading ? "…" : (m?.pipeline.value ?? "—")}
          hint={m ? t(m.pipeline.hintKey) : t("metricPipelineHint")}
          trend={m?.pipeline.trend ?? "up"}
          icon={<Globe2 className="h-4 w-4" />}
        />
      </section>

      {intel.data ? (
        <section
          className="mb-10 grid gap-4 sm:grid-cols-3"
          aria-label={t("intelligenceSectionTitle")}
        >
          <GlassMetric
            label={t("intelligenceAgents")}
            value={String(intel.data.agents.online)}
            hint={t("intelligenceAgentsHint", { total: intel.data.agents.total })}
            icon={<Bot className="h-4 w-4" />}
          />
          <GlassMetric
            label={t("intelligenceProcesses")}
            value={String(intel.data.processes.active)}
            hint={t("intelligenceProcessesHint")}
            icon={<Activity className="h-4 w-4" />}
          />
          <GlassMetric
            label={t("intelligenceRules")}
            value={String(intel.data.rules.lastEvaluationCount)}
            hint={t("intelligenceRulesHint", { catalog: intel.data.rules.catalogSize })}
            trend="up"
            icon={<Sparkles className="h-4 w-4" />}
          />
        </section>
      ) : null}

      {data?.recentLicenses && data.recentLicenses.length > 0 ? (
        <GlassSection
          id="recent-licenses"
          title={t("recentLicensesTitle")}
          subtitle={t("recentLicensesSubtitle")}
          className="mb-10"
        >
          <GlassPanel padding="none" variant="subtle" className="overflow-hidden">
            <ul className="divide-y divide-white/[0.06]">
              {data.recentLicenses.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white/90">{row.client}</p>
                    <p className="nx-type-mono mt-0.5 text-xs text-white/45">{row.formula}</p>
                  </div>
                  <div className="text-right text-xs text-white/50">
                    <p>{row.validUntil}</p>
                    <p className="mt-0.5">{row.createdAgo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </GlassSection>
      ) : null}

      <GlassSection
        id="lab-modules"
        title={t("modulesTitle")}
        subtitle={t("modulesSubtitle")}
        action={
          <Link href="/dashboard/gemini-lab" className="inline-flex">
            <GlassButton variant="primary">{t("openSimulator")}</GlassButton>
          </Link>
        }
        className="mb-10"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((mod) => (
            <GlassModuleTile key={mod.href} {...mod} />
          ))}
        </div>
      </GlassSection>

      {data?.performance ? (
        <GlassPanel padding="sm" variant="subtle" className="mb-6">
          <p className="nx-type-mono text-xs text-white/40">
            DB {data.performance.dbPingMs}ms
            {data.performance.cacheUsed ? ` · ${t("cacheHit")}` : ""}
          </p>
        </GlassPanel>
      ) : null}

      <GlassPanel padding="md" variant="subtle">
        <p className="nx-type-body text-sm">
          <span className="font-semibold text-cyan-200/90">{t("lumenLabel")}</span> {t("lumenNote")}
        </p>
      </GlassPanel>
    </div>
  );
}
