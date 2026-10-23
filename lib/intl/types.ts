import type { CurrencyCode } from "@prisma/client";

export type SupportedLocale = "en" | "de" | "pt" | "hi" | "ar";

export type IntlCurrencyCode = CurrencyCode | "INR";

export type LocaleContext = {
  locale: SupportedLocale;
  bcp47: string;
  currency: IntlCurrencyCode;
  timezone: string;
  rtl: boolean;
  regionId: string;
};

export type FormattedMoney = {
  raw: number;
  currency: IntlCurrencyCode;
  formatted: string;
};

export type FormattedDateTime = {
  utc: string;
  local: string;
  timezone: string;
};
