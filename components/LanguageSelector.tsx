"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Mapeamento estático locale → label + tag operacional.
 * Os valores label/region são jargão de UI (intencionalmente em inglês
 * técnico) para manter a estética de terminal — não vão para i18n.
 */
const localeOptions = [
  { code: "pt", label: "PT-BR", region: "LATAM CORE" },
  { code: "en", label: "EN-US", region: "GLOBAL CORE" },
  { code: "de", label: "DE-EU", region: "EURO CORE" },
  { code: "ar", label: "AR-ME", region: "MID-EAST CORE" },
  { code: "hi", label: "HI-AS", region: "ASIA CORE" },
] as const;

type LocaleCode = (typeof localeOptions)[number]["code"];

export function LanguageSelector() {
  const t = useTranslations("LanguageSelector");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const activeLang = localeOptions.find((lang) => lang.code === currentLocale) ?? localeOptions[1];

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function switchLocale(target: LocaleCode) {
    setIsOpen(false);
    /** next-intl strips the locale prefix de pathname; router.replace re-anexa o novo. */
    router.replace(pathname, { locale: target });
  }

  return (
    <div className="relative font-mono text-xs">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("selectRegion")}
        className="flex items-center gap-2 rounded border border-[#14291f] bg-[#0f1712] px-3 py-1.5 text-white transition-all hover:border-[#10b981]/50 active:scale-[0.98]"
      >
        <Globe className="h-3.5 w-3.5 text-[#10b981]" aria-hidden />
        <span className="font-bold tracking-wider">{activeLang.label}</span>
        <span className="text-[9px] uppercase text-gray-500">({activeLang.region})</span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden />

          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 w-48 animate-fade-in-fast divide-y divide-[#14291f]/40 overflow-hidden rounded border border-[#14291f] bg-[#0f1712] shadow-2xl"
          >
            <div className="bg-[#0c130f] p-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">
              {t("selectRegion")}
            </div>
            {localeOptions.map((lang) => {
              const isActive = currentLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => switchLocale(lang.code)}
                  className={`group flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-[#121f18]/40 ${
                    isActive ? "bg-[#062419] text-[#10b981]" : "text-gray-300"
                  }`}
                >
                  <span className="font-semibold transition-colors group-hover:text-[#10b981]">{lang.label}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{lang.region}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
