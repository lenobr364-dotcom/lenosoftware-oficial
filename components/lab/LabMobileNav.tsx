"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { BarChart3, FlaskConical, LayoutDashboard, Map, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function LabMobileNav() {
  const t = useTranslations("NexusLab");
  const pathname = usePathname() ?? "";

  const items = [
    { href: "/dashboard/nexus-lab", label: t("navOverview"), icon: LayoutDashboard, match: "nexus-lab" },
    { href: "/dashboard/live-operations-map", label: t("navLiveMap"), icon: Map, match: "live-operations-map" },
    { href: "/dashboard/gemini-lab", label: t("navSimulator"), icon: Sparkles, match: "gemini-lab" },
    { href: "/dashboard/analytics", label: t("navAnalytics"), icon: BarChart3, match: "analytics" },
    { href: "/dashboard/laboratorio", label: t("navLab"), icon: FlaskConical, match: "laboratorio" },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(3,5,10,0.88)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden"
      aria-label={t("navMobileAria")}
    >
      <div className="mx-auto flex max-w-lg justify-around gap-1">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = pathname.includes(match);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[0.6rem] font-semibold uppercase tracking-wide transition",
                active
                  ? "bg-cyan-500/15 text-cyan-100"
                  : "text-white/45 hover:text-white/75",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
