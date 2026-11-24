import { Link } from "@/i18n/navigation";
import { BarChart3, Beaker, Cpu, FileCheck, FileText, FlaskConical, Lock, Map, Plug, ScrollText, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

type ModuleDef = {
  href: string;
  icon: LucideIcon;
  titleKey:
    | "homeQuickLiveOps"
    | "homeQuickAnalytics"
    | "homeQuickContracts"
    | "homeQuickApi"
    | "homeQuickSimulator"
    | "homeQuickChemicalVault"
    | "homeQuickSecurityAudit"
    | "homeQuickLicensingEngine"
    | "homeQuickSimulationHub"
    | "homeQuickCompliance"
    | "homeQuickDigitalLab"
    | "homeQuickNexus";
  descKey:
    | "homeQuickLiveOpsDesc"
    | "homeQuickAnalyticsDesc"
    | "homeQuickContractsDesc"
    | "homeQuickApiDesc"
    | "homeQuickSimulatorDesc"
    | "homeQuickChemicalVaultDesc"
    | "homeQuickSecurityAuditDesc"
    | "homeQuickLicensingEngineDesc"
    | "homeQuickSimulationHubDesc"
    | "homeQuickComplianceDesc"
    | "homeQuickDigitalLabDesc"
    | "homeQuickNexusDesc";
  accent: string;
};

const MODULES: ModuleDef[] = [
  {
    href: "/dashboard/chemical-vault",
    icon: Lock,
    titleKey: "homeQuickChemicalVault",
    descKey: "homeQuickChemicalVaultDesc",
    accent: "from-amber-500/25 via-yellow-500/5 to-transparent border-amber-400/30 hover:border-amber-400/45",
  },
  {
    href: "/dashboard/live-operations-map",
    icon: Map,
    titleKey: "homeQuickLiveOps",
    descKey: "homeQuickLiveOpsDesc",
    accent: "from-cyan-500/25 via-cyan-500/5 to-transparent border-cyan-400/25 hover:border-cyan-400/40",
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    titleKey: "homeQuickAnalytics",
    descKey: "homeQuickAnalyticsDesc",
    accent: "from-violet-500/25 via-violet-500/5 to-transparent border-violet-400/25 hover:border-violet-400/40",
  },
  {
    href: "/dashboard/licensing-contracts",
    icon: FileText,
    titleKey: "homeQuickContracts",
    descKey: "homeQuickContractsDesc",
    accent: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-400/25 hover:border-amber-400/40",
  },
  {
    href: "/dashboard/api-integration",
    icon: Plug,
    titleKey: "homeQuickApi",
    descKey: "homeQuickApiDesc",
    accent: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-400/25 hover:border-emerald-400/40",
  },
  {
    href: "/dashboard/formula-simulator",
    icon: Beaker,
    titleKey: "homeQuickSimulator",
    descKey: "homeQuickSimulatorDesc",
    accent: "from-violet-500/25 via-fuchsia-500/5 to-transparent border-violet-400/25 hover:border-violet-400/40",
  },
  {
    href: "/dashboard/security-audit",
    icon: ScrollText,
    titleKey: "homeQuickSecurityAudit",
    descKey: "homeQuickSecurityAuditDesc",
    accent: "from-rose-500/20 via-rose-500/5 to-transparent border-rose-400/25 hover:border-rose-400/40",
  },
  {
    href: "/dashboard/licensing-engine",
    icon: Cpu,
    titleKey: "homeQuickLicensingEngine",
    descKey: "homeQuickLicensingEngineDesc",
    accent: "from-cyan-500/22 via-blue-500/5 to-transparent border-cyan-400/28 hover:border-cyan-400/42",
  },
  {
    href: "/dashboard/simulation-hub",
    icon: Zap,
    titleKey: "homeQuickSimulationHub",
    descKey: "homeQuickSimulationHubDesc",
    accent: "from-fuchsia-500/22 via-violet-500/5 to-transparent border-fuchsia-400/28 hover:border-fuchsia-400/42",
  },
  {
    href: "/dashboard/compliance",
    icon: FileCheck,
    titleKey: "homeQuickCompliance",
    descKey: "homeQuickComplianceDesc",
    accent: "from-teal-500/22 via-emerald-500/5 to-transparent border-teal-400/28 hover:border-teal-400/42",
  },
  {
    href: "/laboratorio",
    icon: FlaskConical,
    titleKey: "homeQuickDigitalLab",
    descKey: "homeQuickDigitalLabDesc",
    accent: "from-violet-500/25 via-cyan-500/5 to-transparent border-violet-400/30 hover:border-violet-400/45",
  },
  {
    href: "/dashboard/nexus-lab",
    icon: Sparkles,
    titleKey: "homeQuickNexus",
    descKey: "homeQuickNexusDesc",
    accent: "from-fuchsia-500/20 via-fuchsia-500/5 to-transparent border-fuchsia-400/20 hover:border-fuchsia-400/35",
  },
];

export async function DashboardQuickModules() {
  const t = await getTranslations("Dashboard");

  return (
    <section aria-labelledby="quick-modules-heading" className="scroll-mt-8">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">{t("homeQuickEyebrow")}</p>
          <h2 id="quick-modules-heading" className="mt-1.5 text-lg font-semibold text-white">
            {t("homeQuickTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">{t("homeQuickSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={[
                "group relative overflow-hidden rounded-2xl border bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200",
                "hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/35",
                mod.accent,
              ].join(" ")}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-black/30 text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Icon className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{t(mod.titleKey)}</span>
                  <span className="mt-1 block text-xs leading-snug text-white/45">{t(mod.descKey)}</span>
                </span>
              </div>
              <span className="relative mt-3 inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70 transition group-hover:text-cyan-100">
                {t("homeQuickOpen")} →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
