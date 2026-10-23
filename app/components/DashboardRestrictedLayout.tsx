"use client";

import { CeoLogoutForm } from "@/app/components/CeoLogoutForm";
import { DashboardSupportFab } from "@/app/components/dashboard/DashboardSupportFab";
import { LicenseeOnboardingTour } from "@/app/components/onboarding/LicenseeOnboardingTour";
import { Link } from "@/i18n/navigation";
import { AdminAlertPoller } from "@/app/components/admin/AdminAlertPoller";
import { SimulatorQuickFab } from "@/components/simulator/SimulatorQuickFab";
import { Award, BarChart3, Beaker, BookOpen, Cpu, FileText, FlaskConical, LifeBuoy, Lock, Map, Plug, Scale, ScrollText, Shield, Ship, Sparkles, UserRound, UsersRound, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function useNavActive() {
  const pathname = usePathname() ?? "";
  const isLeads = pathname.includes("/dashboard/leads");
  const isScalability = pathname.includes("/dashboard/market-scalability");
  const isLogistics = pathname.includes("/dashboard/logistics-global-hub");
  const isCertifications = pathname.includes("/dashboard/certifications");
  const isAnalytics = pathname.includes("/dashboard/analytics");
  const isLicensingContracts = pathname.includes("/dashboard/licensing-contracts");
  const isApiIntegration = pathname.includes("/dashboard/api-integration");
  const isFormulaSimulator = pathname.includes("/dashboard/formula-simulator");
  const isSecurityAudit = pathname.includes("/dashboard/security-audit");
  const isLicensingEngine = pathname.includes("/dashboard/licensing-engine");
  const isSimulationHub = pathname.includes("/dashboard/simulation-hub");
  const isChemicalVault = pathname.includes("/dashboard/chemical-vault");
  const isCourse = pathname.includes("/dashboard/curso");
  const isAdminMonitor = pathname.includes("/dashboard/admin-monitor");
  const isSupport = pathname.includes("/dashboard/support");
  const isProfile = pathname.includes("/dashboard/profile");
  const isLiveOpsMap = pathname.includes("/dashboard/live-operations-map");
  const isNexusLab =
    pathname.includes("/dashboard/nexus-lab") ||
    pathname.includes("/dashboard/laboratorio") ||
    isLiveOpsMap;
  const isVault =
    pathname.includes("/dashboard") &&
    !isAdminMonitor &&
    !isLeads &&
    !isScalability &&
    !isLogistics &&
    !isCertifications &&
    !isAnalytics &&
    !isLicensingContracts &&
    !isApiIntegration &&
    !isFormulaSimulator &&
    !isSecurityAudit &&
    !isLicensingEngine &&
    !isSimulationHub &&
    !isChemicalVault &&
    !isCourse &&
    !isSupport &&
    !isProfile &&
    !isNexusLab &&
    !isLiveOpsMap &&
    !pathname.includes("/dashboard/formula") &&
    !pathname.includes("/dashboard/formulas");
  return {
    isLeads,
    isVault,
    isNexusLab,
    isLiveOpsMap,
    isScalability,
    isLogistics,
    isCertifications,
    isAnalytics,
    isLicensingContracts,
    isApiIntegration,
    isFormulaSimulator,
    isSecurityAudit,
    isLicensingEngine,
    isSimulationHub,
    isChemicalVault,
    isCourse,
    isAdminMonitor,
    isSupport,
    isProfile,
  };
}

const navBtnBase =
  "group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-medium tracking-tight transition-all duration-200";

function navBtnClass(active: boolean): string {
  if (active) {
    return [
      navBtnBase,
      "border-amber-400/35 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-50 shadow-[0_0_28px_rgba(251,191,36,0.12)]",
    ].join(" ");
  }
  return [
    navBtnBase,
    "border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-neutral-100",
  ].join(" ");
}

const iconWrap = (active: boolean) =>
  [
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
    active
      ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
      : "border-white/10 bg-black/30 text-neutral-500 group-hover:border-white/15 group-hover:text-neutral-300",
  ].join(" ");

function NavSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-3 text-[0.55rem] font-semibold uppercase tracking-[0.26em] text-neutral-500 first:pt-0">
      {children}
    </p>
  );
}

export function DashboardRestrictedLayout({ locale, children }: { locale: string; children: ReactNode }) {
  const t = useTranslations("Dashboard");
  const {
    isLeads,
    isVault,
    isNexusLab,
    isLiveOpsMap,
    isScalability,
    isLogistics,
    isCertifications,
    isAnalytics,
    isLicensingContracts,
    isApiIntegration,
    isFormulaSimulator,
    isSecurityAudit,
    isLicensingEngine,
    isSimulationHub,
    isChemicalVault,
    isCourse,
    isAdminMonitor,
    isSupport,
    isProfile,
  } = useNavActive();

  const mobileBar = [
    "fixed inset-x-0 bottom-0 z-50 md:hidden",
    "border-t border-white/10 bg-gradient-to-t from-black/90 via-black/75 to-black/40 backdrop-blur-2xl",
    "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_40px_rgba(0,0,0,0.45)]",
  ].join(" ");

  const mobileLink = (active: boolean) =>
    [
      "flex min-h-[3.4rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 text-[0.55rem] font-semibold uppercase leading-tight tracking-[0.08em] transition-all",
      active
        ? "border-amber-400/35 bg-amber-500/15 text-amber-100"
        : "border-transparent bg-transparent text-neutral-500 hover:text-neutral-300",
    ].join(" ");

  return (
    <div className="min-h-screen bg-black text-white">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col md:flex",
          "border-r border-white/10 bg-gradient-to-b from-white/[0.09] via-black/50 to-black/80 backdrop-blur-2xl",
          "shadow-[4px_0_48px_rgba(0,0,0,0.35)]",
        ].join(" ")}
        aria-label={t("sidebarNavAria")}
      >
        <div className="flex flex-col gap-1 border-b border-white/[0.07] px-4 pb-5 pt-6">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-amber-300/70">{t("sidebarRestrictedEyebrow")}</p>
          <p className="mt-1.5 text-xs font-medium leading-snug text-neutral-400">{t("sidebarRestrictedHint")}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3 [-webkit-overflow-scrolling:touch]" aria-label={t("sidebarNavAria")}>
          <NavSectionLabel>{t("sidebarSectionCore")}</NavSectionLabel>
          <Link href="/dashboard" className={navBtnClass(isVault)} aria-current={isVault ? "page" : undefined}>
            <span className={iconWrap(isVault)} aria-hidden>
              <FlaskConical className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavVault")}</span>
          </Link>
          <Link
            href="/dashboard/chemical-vault"
            className={navBtnClass(isChemicalVault)}
            aria-current={isChemicalVault ? "page" : undefined}
          >
            <span className={iconWrap(isChemicalVault)} aria-hidden>
              <Lock className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavChemicalVault")}</span>
          </Link>
          <NavSectionLabel>{t("sidebarSectionAdvanced")}</NavSectionLabel>
          <Link href="/dashboard/nexus-lab" className={navBtnClass(isNexusLab && !isLiveOpsMap)} aria-current={isNexusLab && !isLiveOpsMap ? "page" : undefined}>
            <span className={iconWrap(isNexusLab && !isLiveOpsMap)} aria-hidden>
              <Sparkles className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavNexusLab")}</span>
          </Link>
          <Link
            href="/dashboard/live-operations-map"
            className={navBtnClass(isLiveOpsMap)}
            aria-current={isLiveOpsMap ? "page" : undefined}
          >
            <span className={iconWrap(isLiveOpsMap)} aria-hidden>
              <Map className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavLiveOpsMap")}</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className={navBtnClass(isAnalytics)}
            aria-current={isAnalytics ? "page" : undefined}
          >
            <span className={iconWrap(isAnalytics)} aria-hidden>
              <BarChart3 className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavAnalytics")}</span>
          </Link>
          <Link
            href="/dashboard/licensing-contracts"
            className={navBtnClass(isLicensingContracts)}
            aria-current={isLicensingContracts ? "page" : undefined}
          >
            <span className={iconWrap(isLicensingContracts)} aria-hidden>
              <FileText className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavLicensingContracts")}</span>
          </Link>
          <Link
            href="/dashboard/api-integration"
            className={navBtnClass(isApiIntegration)}
            aria-current={isApiIntegration ? "page" : undefined}
          >
            <span className={iconWrap(isApiIntegration)} aria-hidden>
              <Plug className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavApiIntegration")}</span>
          </Link>
          <Link
            href="/dashboard/formula-simulator"
            className={navBtnClass(isFormulaSimulator)}
            aria-current={isFormulaSimulator ? "page" : undefined}
          >
            <span className={iconWrap(isFormulaSimulator)} aria-hidden>
              <Beaker className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavFormulaSimulator")}</span>
          </Link>
          <Link
            href="/dashboard/security-audit"
            className={navBtnClass(isSecurityAudit)}
            aria-current={isSecurityAudit ? "page" : undefined}
          >
            <span className={iconWrap(isSecurityAudit)} aria-hidden>
              <ScrollText className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavSecurityAudit")}</span>
          </Link>
          <Link
            href="/dashboard/licensing-engine"
            className={navBtnClass(isLicensingEngine)}
            aria-current={isLicensingEngine ? "page" : undefined}
          >
            <span className={iconWrap(isLicensingEngine)} aria-hidden>
              <Cpu className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavLicensingEngine")}</span>
          </Link>
          <Link
            href="/dashboard/simulation-hub"
            className={navBtnClass(isSimulationHub)}
            aria-current={isSimulationHub ? "page" : undefined}
          >
            <span className={iconWrap(isSimulationHub)} aria-hidden>
              <Zap className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavSimulationHub")}</span>
          </Link>
          <NavSectionLabel>{t("sidebarSectionOperations")}</NavSectionLabel>
          <Link
            href="/dashboard/admin-monitor"
            className={navBtnClass(isAdminMonitor)}
            aria-current={isAdminMonitor ? "page" : undefined}
          >
            <span className={iconWrap(isAdminMonitor)} aria-hidden>
              <Shield className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavAdmin")}</span>
          </Link>
          <Link href="/dashboard/leads" className={navBtnClass(isLeads)} aria-current={isLeads ? "page" : undefined}>
            <span className={iconWrap(isLeads)} aria-hidden>
              <UsersRound className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavLeads")}</span>
          </Link>
          <Link
            href="/dashboard/market-scalability"
            className={navBtnClass(isScalability)}
            aria-current={isScalability ? "page" : undefined}
          >
            <span className={iconWrap(isScalability)} aria-hidden>
              <Scale className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavScalability")}</span>
          </Link>
          <Link
            href="/dashboard/logistics-global-hub"
            className={navBtnClass(isLogistics)}
            aria-current={isLogistics ? "page" : undefined}
          >
            <span className={iconWrap(isLogistics)} aria-hidden>
              <Ship className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavLogistics")}</span>
          </Link>
          <Link
            href="/dashboard/certifications"
            className={navBtnClass(isCertifications)}
            aria-current={isCertifications ? "page" : undefined}
          >
            <span className={iconWrap(isCertifications)} aria-hidden>
              <Award className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavCertifications")}</span>
          </Link>
          <Link href="/dashboard/curso" className={navBtnClass(isCourse)} aria-current={isCourse ? "page" : undefined}>
            <span className={iconWrap(isCourse)} aria-hidden>
              <BookOpen className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavCourse")}</span>
          </Link>
          <Link href="/dashboard/support" className={navBtnClass(isSupport)} aria-current={isSupport ? "page" : undefined}>
            <span className={iconWrap(isSupport)} aria-hidden>
              <LifeBuoy className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavSupport")}</span>
          </Link>
          <Link href="/dashboard/profile" className={navBtnClass(isProfile)} aria-current={isProfile ? "page" : undefined}>
            <span className={iconWrap(isProfile)} aria-hidden>
              <UserRound className="h-[1.125rem] w-[1.125rem] stroke-[1.75]" />
            </span>
            <span className="leading-snug">{t("sidebarNavProfile")}</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/[0.07] p-4">
          <CeoLogoutForm locale={locale} label={t("executiveLogout")} buttonClassName="w-full justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 transition hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-100/90" />
        </div>
      </aside>

      <div className="relative md:pl-[15.5rem] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="pointer-events-none fixed inset-0 z-0 md:left-[15.5rem]" aria-hidden>
          <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.05] blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-violet-500/[0.04] blur-3xl" />
        </div>
        <div className="relative z-[1] min-h-screen transition-opacity duration-200 motion-reduce:transition-none">
          <AdminAlertPoller />
          <LicenseeOnboardingTour />
          <DashboardSupportFab />
          <SimulatorQuickFab />
          {children}
        </div>
      </div>

      <nav className={mobileBar} aria-label={t("sidebarMobileNavAria")}>
        <div className="mx-auto flex w-full max-w-4xl flex-nowrap items-stretch gap-0.5 overflow-x-auto px-1 pb-0.5 [-webkit-overflow-scrolling:touch]">
          <Link href="/dashboard" className={`${mobileLink(isVault)} min-w-[4.25rem] shrink-0`} aria-current={isVault ? "page" : undefined}>
            <FlaskConical className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavVault")}</span>
          </Link>
          <Link
            href="/dashboard/nexus-lab"
            className={`${mobileLink(isNexusLab && !isLiveOpsMap)} min-w-[4.25rem] shrink-0`}
            aria-current={isNexusLab && !isLiveOpsMap ? "page" : undefined}
          >
            <Sparkles className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavNexusLab")}</span>
          </Link>
          <Link
            href="/dashboard/live-operations-map"
            className={`${mobileLink(isLiveOpsMap)} min-w-[4.25rem] shrink-0`}
            aria-current={isLiveOpsMap ? "page" : undefined}
          >
            <Map className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavLiveOpsMap")}</span>
          </Link>
          <Link href="/dashboard/analytics" className={`${mobileLink(isAnalytics)} min-w-[4.25rem] shrink-0`} aria-current={isAnalytics ? "page" : undefined}>
            <BarChart3 className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavAnalytics")}</span>
          </Link>
          <Link
            href="/dashboard/licensing-contracts"
            className={`${mobileLink(isLicensingContracts)} min-w-[4.1rem] shrink-0`}
            aria-current={isLicensingContracts ? "page" : undefined}
          >
            <FileText className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavLicensingContracts")}</span>
          </Link>
          <Link
            href="/dashboard/api-integration"
            className={`${mobileLink(isApiIntegration)} min-w-[4.1rem] shrink-0`}
            aria-current={isApiIntegration ? "page" : undefined}
          >
            <Plug className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavApiIntegration")}</span>
          </Link>
          <Link href="/dashboard/admin-monitor" className={`${mobileLink(isAdminMonitor)} min-w-[4.25rem] shrink-0`} aria-current={isAdminMonitor ? "page" : undefined}>
            <Shield className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavAdmin")}</span>
          </Link>
          <Link href="/dashboard/leads" className={`${mobileLink(isLeads)} min-w-[4.25rem] shrink-0`} aria-current={isLeads ? "page" : undefined}>
            <UsersRound className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavLeads")}</span>
          </Link>
          <Link href="/dashboard/market-scalability" className={`${mobileLink(isScalability)} min-w-[4.25rem] shrink-0`} aria-current={isScalability ? "page" : undefined}>
            <Scale className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavScalability")}</span>
          </Link>
          <Link href="/dashboard/logistics-global-hub" className={`${mobileLink(isLogistics)} min-w-[4.25rem] shrink-0`} aria-current={isLogistics ? "page" : undefined}>
            <Ship className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavLogistics")}</span>
          </Link>
          <Link
            href="/dashboard/certifications"
            className={`${mobileLink(isCertifications)} min-w-[4.25rem] shrink-0`}
            aria-current={isCertifications ? "page" : undefined}
          >
            <Award className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavCertifications")}</span>
          </Link>
          <Link href="/dashboard/curso" className={`${mobileLink(isCourse)} min-w-[4.25rem] shrink-0`} aria-current={isCourse ? "page" : undefined}>
            <BookOpen className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavCourse")}</span>
          </Link>
          <Link href="/dashboard/support" className={`${mobileLink(isSupport)} min-w-[4.25rem] shrink-0`} aria-current={isSupport ? "page" : undefined}>
            <LifeBuoy className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavSupport")}</span>
          </Link>
          <Link href="/dashboard/profile" className={`${mobileLink(isProfile)} min-w-[4.25rem] shrink-0`} aria-current={isProfile ? "page" : undefined}>
            <UserRound className="h-4 w-4 shrink-0 stroke-[1.75]" aria-hidden />
            <span className="line-clamp-2 text-center">{t("sidebarNavProfile")}</span>
          </Link>
          <div className="flex min-w-[4.25rem] shrink-0 items-center justify-center">
            <CeoLogoutForm
              locale={locale}
              label={t("sidebarMobileLogout")}
              buttonClassName="flex min-h-[3.4rem] w-full flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-1 py-1 text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.06em] text-neutral-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-100/90"
            />
          </div>
        </div>
      </nav>
    </div>
  );
}
