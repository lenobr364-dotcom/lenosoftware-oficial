/**
 * Motor internacional unificado — moeda, data, fuso e números (operações globais).
 */

import { routing, isRtlLocale } from "@/i18n/routing";
import { NEXUS_HQ } from "@/lib/nexus-legal-identity";
import {
  convertBrlToDisplay,
  displayCurrencyForLocale,
  localeTagForFormat,
  type VaultDisplayCurrency,
} from "@/lib/market-scalability-fx";
import type { FormattedDateTime, FormattedMoney, IntlCurrencyCode, LocaleContext, SupportedLocale } from "./types";

/** Fuso da matriz BIJU (Barra do Garças). */
export const HQ_TIMEZONE = "America/Cuiaba";

const LOCALE_TIMEZONE: Record<SupportedLocale, string> = {
  pt: HQ_TIMEZONE,
  en: "America/New_York",
  de: "Europe/Berlin",
  hi: "Asia/Kolkata",
  ar: "Asia/Dubai",
};

const REGION_BY_LOCALE: Record<SupportedLocale, string> = {
  pt: "latam",
  en: "americas",
  de: "europe",
  hi: "asia",
  ar: "mena",
};

export function normalizeLocale(input?: string | null): SupportedLocale {
  const raw = (input ?? routing.defaultLocale).toLowerCase().split("-")[0];
  if (routing.locales.includes(raw as SupportedLocale)) {
    return raw as SupportedLocale;
  }
  return routing.defaultLocale as SupportedLocale;
}

export function resolveLocaleContext(localeInput?: string | null): LocaleContext {
  const locale = normalizeLocale(localeInput);
  const vaultCurrency = displayCurrencyForLocale(locale);
  const currency: IntlCurrencyCode =
    vaultCurrency === "INR" ? "INR" : (vaultCurrency as IntlCurrencyCode);

  return {
    locale,
    bcp47: localeTagForFormat(locale),
    currency,
    timezone: LOCALE_TIMEZONE[locale] ?? HQ_TIMEZONE,
    rtl: isRtlLocale(locale),
    regionId: REGION_BY_LOCALE[locale] ?? "global",
  };
}

export function formatMoney(
  amountBrl: number,
  ctx: LocaleContext,
  options?: Intl.NumberFormatOptions,
): FormattedMoney {
  const displayAmount =
    ctx.currency === "BRL"
      ? amountBrl
      : ctx.currency === "INR"
        ? convertBrlToDisplay(amountBrl, ctx.locale)
        : convertBrlToDisplay(amountBrl, ctx.locale);

  const currencyForIntl =
    ctx.currency === "INR" ? "INR" : (ctx.currency as Exclude<IntlCurrencyCode, "INR">);

  const formatted = new Intl.NumberFormat(ctx.bcp47, {
    style: "currency",
    currency: currencyForIntl,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
    ...options,
  }).format(displayAmount);

  return { raw: displayAmount, currency: ctx.currency, formatted };
}

export function formatNumber(value: number, ctx: LocaleContext, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(ctx.bcp47, options).format(value);
}

export function formatPercent(value: number, ctx: LocaleContext, digits = 1): string {
  return new Intl.NumberFormat(ctx.bcp47, {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(
  date: Date | string | number,
  ctx: LocaleContext,
  style: Intl.DateTimeFormatOptions["dateStyle"] = "medium",
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(ctx.bcp47, {
    dateStyle: style,
    timeZone: ctx.timezone,
  }).format(d);
}

export function formatDateTime(
  date: Date | string | number,
  ctx: LocaleContext,
): FormattedDateTime {
  const d = date instanceof Date ? date : new Date(date);
  const utc = d.toISOString();

  const local = new Intl.DateTimeFormat(ctx.bcp47, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ctx.timezone,
  }).format(d);

  return { utc, local, timezone: ctx.timezone };
}

export function formatRelativeTime(
  date: Date | string | number,
  ctx: LocaleContext,
  base: Date = new Date(),
): string {
  const d = date instanceof Date ? date : new Date(date);
  const diffSec = Math.round((d.getTime() - base.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(ctx.bcp47, { numeric: "auto" });

  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86400), "day");
}

export function nowInTimezone(ctx: LocaleContext): FormattedDateTime {
  return formatDateTime(new Date(), ctx);
}

export function headquartersLabel(ctx: LocaleContext): string {
  return `${NEXUS_HQ.city}, ${NEXUS_HQ.state} · ${NEXUS_HQ.cep}`;
}

/** Converte valor canônico BRL armazenado em BD para exibição regional. */
export function fromCanonicalBrl(storedBrl: number, ctx: LocaleContext): FormattedMoney {
  return formatMoney(storedBrl, ctx);
}

export type { VaultDisplayCurrency };
