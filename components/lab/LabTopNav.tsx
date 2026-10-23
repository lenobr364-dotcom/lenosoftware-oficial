"use client";

import { LabLocaleSwitcher } from "@/components/lab/LabLocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { FlaskConical, LayoutDashboard, Map, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function LabTopNav() {
  const t = useTranslations("NexusLab");
  const pathname = usePathname() ?? "";

  const links = [
    { href: "/dashboard/nexus-lab", label: t("navOverview"), icon: LayoutDashboard, match: "nexus-lab" },
    { href: "/dashboard/laboratorio", label: t("navLab"), icon: FlaskConical, match: "laboratorio" },
    { href: "/dashboard/gemini-lab", label: t("navSimulator"), icon: Sparkles, match: "gemini-lab" },
    { href: "/dashboard/live-operations-map", label: t("navLiveMap"), icon: Map, match: "live-operations-map" },
  ] as const;

  return (
    <header className="nx-glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/nexus-lab"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-300 shadow-[var(--nx-glass-shadow-soft)]"
            aria-label={t("title")}
          >
            <FlaskConical className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </Link>
          <div>
            <p className="nx-type-eyebrow text-[0.6rem]">ChemVault</p>
            <p className="text-sm font-semibold tracking-tight text-white/90">NEXUS Lab</p>
          </div>
        </div>

        <nav className="hidden flex-wrap items-center gap-1 md:flex" aria-label={t("navAria")}>
          {links.map(({ href, label, icon: Icon, match }) => {
            const active = pathname.includes(match);
            return (
              <Link
                key={href}
                href={href}
                className={`nx-glass-nav-link ${active ? "nx-glass-nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4 opacity-80" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <LabLocaleSwitcher />
          <Link href="/dashboard" className="nx-glass-nav-link hidden sm:inline-flex">
            {t("backDashboard")}
          </Link>
        </div>
      </div>
    </header>
  );
}
