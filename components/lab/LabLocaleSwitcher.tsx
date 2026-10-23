"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  pt: "PT",
  de: "DE",
  hi: "HI",
  ar: "AR",
};

export function LabLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl"
      role="navigation"
      aria-label="Language"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={[
              "nx-glass-nav-link min-w-[2.25rem] justify-center px-2.5 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider",
              active ? "nx-glass-nav-link--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "true" : undefined}
          >
            {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
