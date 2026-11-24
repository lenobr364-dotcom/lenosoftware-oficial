import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  /** en · pt · es na navegação pública. de, hi e ar permanecem acessíveis pelo URL. */
  locales: ["en", "de", "pt", "es", "hi", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  /** Cookie + Accept-Language para alinhar UI ao utilizador. */
  localeDetection: true,
});

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}
