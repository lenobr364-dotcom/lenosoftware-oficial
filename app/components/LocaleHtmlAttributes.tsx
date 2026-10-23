"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

const localeToHtmlLang: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  pt: "pt-BR",
  hi: "hi-IN",
  ar: "ar-AE",
};

/**
 * Keeps `<html lang>` and `dir` aligned with the active next-intl locale (App Router keeps a single root `<html>`).
 */
export function LocaleHtmlAttributes() {
  const locale = useLocale();

  useEffect(() => {
    const lang = localeToHtmlLang[locale] ?? "en-US";
    document.documentElement.lang = lang;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
