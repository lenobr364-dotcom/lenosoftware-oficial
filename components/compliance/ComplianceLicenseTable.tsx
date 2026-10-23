"use client";

import type { FormulaLicenseRow } from "@/lib/licensing-engine/types";
import { FileCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type ComplianceLicenseTableProps = {
  rows: FormulaLicenseRow[];
  loading?: boolean;
  busyId: string | null;
  onGenerateCertificate: (id: string) => void;
};

function statusTone(status: FormulaLicenseRow["status"]): string {
  if (status === "ACTIVE") return "border-emerald-400/30 bg-emerald-500/12 text-emerald-100 backdrop-blur-md";
  return "border-rose-400/30 bg-rose-500/12 text-rose-100 backdrop-blur-md";
}

function validityTone(validity: FormulaLicenseRow["validity"]): string {
  if (validity === "VALID") return "border-cyan-400/25 bg-cyan-500/10 text-cyan-100 backdrop-blur-md";
  if (validity === "EXPIRED") return "border-amber-400/25 bg-amber-500/10 text-amber-100 backdrop-blur-md";
  return "border-white/15 bg-white/[0.06] text-white/55 backdrop-blur-md";
}

export function ComplianceLicenseTable({
  rows,
  loading,
  busyId,
  onGenerateCertificate,
}: ComplianceLicenseTableProps) {
  const t = useTranslations("ComplianceExport");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-white/90">{t("tableTitle")}</p>
        <p className="text-xs text-white/40">{t("tableSubtitle")}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm" aria-busy={loading}>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45 sm:px-5">
                {t("colFormula")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colClient")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colPeriod")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colStatus")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colValidity")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk_${i}`} className="border-b border-white/[0.05]">
                    <td colSpan={6} className="px-5 py-3">
                      <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
                    </td>
                  </tr>
                ))
              : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-white/40">
                  {t("emptyTable")}
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/[0.06] bg-white/[0.02] transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <td className="px-4 py-3 sm:px-5">
                  <p className="font-medium text-white/85">{row.formulaName}</p>
                  <p className="nx-type-mono mt-0.5 text-xs text-cyan-100/55">{row.formulaCode}</p>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-xs text-white/65">{row.clientSubject}</td>
                <td className="px-4 py-3 text-xs text-white/45">
                  {new Date(row.validFrom).toLocaleDateString(locale)} →{" "}
                  {new Date(row.validUntil).toLocaleDateString(locale)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider ${statusTone(row.status)}`}
                  >
                    {t(`status_${row.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider ${validityTone(row.validity)}`}
                  >
                    {t(`validity_${row.validity}`)}
                  </span>
                </td>
                <td className="px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => onGenerateCertificate(row.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/12 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-wider text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 disabled:opacity-50"
                  >
                    <FileCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {busyId === row.id ? t("generatingCert") : t("generateCert")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


