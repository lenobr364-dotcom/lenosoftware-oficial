"use client";

import { Link } from "@/i18n/navigation";
import { Beaker } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function SimulatorQuickFab() {
  const t = useTranslations("FormulaSimulator");
  const pathname = usePathname() ?? "";
  if (pathname.includes("/dashboard/formula-simulator")) return null;

  return (
    <Link
      href="/dashboard/formula-simulator"
      className={[
        "fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-8 md:right-8",
        "hidden sm:inline-flex items-center gap-2.5 rounded-2xl border border-violet-400/30",
        "bg-gradient-to-r from-violet-500/25 via-white/10 to-cyan-500/15 px-4 py-3",
        "text-xs font-semibold uppercase tracking-[0.14em] text-white/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
        "backdrop-blur-2xl transition hover:border-violet-300/45 hover:shadow-[0_16px_48px_rgba(139,92,246,0.25)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40",
      ].join(" ")}
      title={t("fabOpen")}
    >
      <Beaker className="h-4 w-4 text-violet-200" aria-hidden />
      <span>{t("fabLabel")}</span>
    </Link>
  );
}
