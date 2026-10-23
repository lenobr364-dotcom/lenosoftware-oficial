import type { SupportedLocale } from "@/lib/intl/types";
import { normalizeLocale } from "@/lib/intl/global-intl";

const REGION_LABELS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    hq: "HQ · Barra do Garças",
    latam: "Americas",
    americas: "Americas",
    europe: "Europe",
    asia: "Asia",
    mena: "MENA",
    BR: "Brazil",
    US: "United States",
    DE: "Germany",
    IN: "India",
    AE: "UAE",
    unknown: "Global",
  },
  pt: {
    hq: "Matriz · Barra do Garças",
    latam: "Américas",
    americas: "Américas",
    europe: "Europa",
    asia: "Ásia",
    mena: "MENA",
    BR: "Brasil",
    US: "Estados Unidos",
    DE: "Alemanha",
    IN: "Índia",
    AE: "Emirados",
    unknown: "Global",
  },
  de: {
    hq: "HQ · Barra do Garças",
    latam: "Amerika",
    americas: "Amerika",
    europe: "Europa",
    asia: "Asien",
    mena: "MENA",
    BR: "Brasilien",
    US: "USA",
    DE: "Deutschland",
    IN: "Indien",
    AE: "VAE",
    unknown: "Global",
  },
  hi: {
    hq: "मुख्यालय · Barra do Garças",
    latam: "अमेरिका",
    americas: "अमेरिका",
    europe: "यूरोप",
    asia: "एशिया",
    mena: "MENA",
    BR: "ब्राज़ील",
    US: "संयुक्त राज्य",
    DE: "जर्मनी",
    IN: "भारत",
    AE: "यूएई",
    unknown: "वैश्विक",
  },
  ar: {
    hq: "المقر · Barra do Garças",
    latam: "الأمريكتان",
    americas: "الأمريكتان",
    europe: "أوروبا",
    asia: "آسيا",
    mena: "الشرق الأوسط",
    BR: "البرازيل",
    US: "الولايات المتحدة",
    DE: "ألمانيا",
    IN: "الهند",
    AE: "الإمارات",
    unknown: "عالمي",
  },
};

export function regionLabelForLocale(localeInput: string | null | undefined, key: string): string {
  const locale = normalizeLocale(localeInput);
  const table = REGION_LABELS[locale] ?? REGION_LABELS.en;
  return table[key] ?? table.unknown ?? key;
}
