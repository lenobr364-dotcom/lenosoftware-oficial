"use client";

import { Link, usePathname } from "@/i18n/navigation";

const LOCALES = [
  { id: "pt", label: "PT" },
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
] as const;

export function LocaleSwitch() {
  const pathname = usePathname();

  return (
    <nav aria-label="Language" className="flex items-center gap-1">
      {LOCALES.map((locale) => (
        <Link
          key={locale.id}
          href={pathname || "/"}
          locale={locale.id}
          className="rounded-full border border-[#D4AF37]/25 px-2.5 py-1 text-[0.65rem] tracking-[0.14em] text-[#f4f1ea]/80 transition hover:border-[#10B981] hover:text-[#10B981]"
        >
          {locale.label}
        </Link>
      ))}
    </nav>
  );
}
