import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  /** en: Americas · de: Europa · pt: Brasil · hi: Índia · ar: mercados árabes (RTL) */
  locales: ["en", "de", "pt", "hi", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  /** Cookie + Accept-Language para alinhar UI ao utilizador. */
  localeDetection: true,
});

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}
