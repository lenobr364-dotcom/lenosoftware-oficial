"use client";

import { Link } from "@/i18n/navigation";
import { LifeBuoy } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardSupportFab() {
  const t = useTranslations("Dashboard");

  return (
    <div className="pointer-events-none fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-[60] md:bottom-8 md:right-8">
      <Link
        href="/dashboard/support"
        className={[
          "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border md:h-16 md:w-16",
          "border-cyan-400/35 bg-gradient-to-br from-cyan-500/25 via-black/60 to-fuchsia-500/20",
          "text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "backdrop-blur-xl transition hover:border-amber-300/40 hover:shadow-[0_0_40px_rgba(251,191,36,0.2)]",
        ].join(" ")}
        aria-label={t("supportFabAria")}
        title={t("supportFabLabel")}
      >
        <LifeBuoy className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} aria-hidden />
      </Link>
    </div>
  );
}
