"use client";

import { Link } from "@/i18n/navigation";
import type { FormulaCatalogRow, LicenseStatus } from "@/lib/formulas-catalog";
import { tableGlassBodyRow, tableGlassHeadRow, tableGlassWrap } from "@/lib/ui-glass";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type Props = {
  formulas: FormulaCatalogRow[];
  locale: string;
};

function formatLastUpdated(iso: string, locale: string) {
  const localeTag =
    locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.DateTimeFormat(localeTag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function licenseBadgeClass(license: LicenseStatus) {
  switch (license) {
    case "active":
      return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
    case "renewal":
      return "border-amber-400/40 bg-amber-500/12 text-amber-200";
    case "pending":
      return "border-rose-400/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-white/15 bg-white/5 text-gray-300";
  }
}

export function DashboardFormulaTable({ formulas, locale }: Props) {
  const t = useTranslations("Dashboard");
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return formulas;
    return formulas.filter((row) => {
      const hay = `${row.name} ${row.code} ${row.id}`.toLowerCase();
      return hay.includes(normalized);
    });
  }, [formulas, normalized]);

  function licenseLabel(license: LicenseStatus) {
    switch (license) {
      case "active":
        return t("licenseActive");
      case "renewal":
        return t("licenseRenewal");
      case "pending":
        return t("licensePending");
      default:
        return "";
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="formula-search" className="sr-only">
            {t("searchAria")}
          </label>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500/50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            id="formula-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            className="w-full rounded-2xl border border-white/12 bg-white/[0.06] py-3.5 pl-11 pr-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none backdrop-blur-md transition placeholder:text-gray-500 focus:border-yellow-400/35 focus:bg-white/[0.09] focus:shadow-[0_0_0_1px_rgba(234,179,8,0.12),0_0_24px_rgba(234,179,8,0.08)]"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
          {t("searchHint", { shown: filtered.length, total: formulas.length })}
        </p>
      </div>

      <div className={`ring-1 ring-yellow-500/[0.08] ${tableGlassWrap}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className={tableGlassHeadRow}>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  {t("colName")}
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  {t("colCode")}
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  {t("colLicense")}
                </th>
                <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  {t("colUpdated")}
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                  {t("colActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-sm text-gray-400">
                    {t("searchEmpty")}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={`group ${tableGlassBodyRow} bg-white/[0.02] transition-all duration-200 ease-out hover:bg-yellow-500/12 hover:shadow-[inset_0_0_0_1px_rgba(234,179,8,0.16),0_0_28px_rgba(234,179,8,0.08)]`}
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/formula/${row.id}`}
                        className="block rounded-lg outline-none ring-yellow-400/0 transition focus-visible:ring-2 focus-visible:ring-yellow-400/40"
                      >
                        <p className="font-medium text-white underline decoration-yellow-500/0 decoration-1 underline-offset-4 transition group-hover:decoration-yellow-400/60">
                          {row.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">ID interno · {row.id}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-yellow-100/90 transition group-hover:border-yellow-500/20 group-hover:bg-yellow-500/[0.06]">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider",
                          licenseBadgeClass(row.license),
                        ].join(" ")}
                      >
                        {licenseLabel(row.license)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <time
                        dateTime={row.lastUpdated}
                        className="text-sm tabular-nums tracking-tight text-gray-200/95"
                        title={row.lastUpdated}
                      >
                        {formatLastUpdated(row.lastUpdated, locale)}
                      </time>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/formula/${row.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-200 transition hover:border-yellow-400/35 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/25"
                        >
                          {t("actionView")}
                        </Link>
                        <Link
                          href={`/dashboard/market-scalability?formula=${encodeURIComponent(row.id)}`}
                          className="inline-flex items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-yellow-200 transition hover:border-yellow-300/50 hover:bg-yellow-500/15 focus:outline-none focus:ring-2 focus:ring-yellow-300/25"
                        >
                          {t("actionCalc")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
