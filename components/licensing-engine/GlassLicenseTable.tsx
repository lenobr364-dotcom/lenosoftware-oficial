"use client";

import type { FormulaLicenseRow } from "@/lib/licensing-engine/types";
import { LockOpen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type GlassLicenseTableProps = {
  rows: FormulaLicenseRow[];
  loading?: boolean;
  busyId: string | null;
  onApprove: (id: string) => void;
  onRevoke: (id: string) => void;
  onUnlock: (row: FormulaLicenseRow) => void;
};

function statusTone(status: FormulaLicenseRow["status"]): string {
  if (status === "ACTIVE") return "border-emerald-400/30 bg-emerald-500/12 text-emerald-100 backdrop-blur-md";
  if (status === "PENDING") return "border-amber-400/30 bg-amber-500/12 text-amber-100 backdrop-blur-md";
  return "border-rose-400/30 bg-rose-500/12 text-rose-100 backdrop-blur-md";
}

function validityTone(validity: FormulaLicenseRow["validity"]): string {
  if (validity === "VALID") return "border-cyan-400/25 bg-cyan-500/10 text-cyan-100 backdrop-blur-md";
  if (validity === "PENDING") return "border-violet-400/25 bg-violet-500/10 text-violet-100 backdrop-blur-md";
  return "border-white/15 bg-white/[0.06] text-white/55 backdrop-blur-md";
}

export function GlassLicenseTable({
  rows,
  loading,
  busyId,
  onApprove,
  onRevoke,
  onUnlock,
}: GlassLicenseTableProps) {
  const t = useTranslations("SmartLicensingEngine");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-white/90">{t("tableTitle")}</p>
        <p className="text-xs text-white/40">{t("tableSubtitle")}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm" aria-busy={loading}>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45 sm:px-5">
                {t("colFormula")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colClient")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colValidity")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colStatus")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colAnchor")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
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
                  <p>
                    {new Date(row.validFrom).toLocaleDateString(locale)} →{" "}
                    {new Date(row.validUntil).toLocaleDateString(locale)}
                  </p>
                  <span
                    className={[
                      "mt-1.5 inline-flex rounded-lg border px-2 py-0.5 text-[0.62rem] font-semibold uppercase",
                      validityTone(row.validity),
                    ].join(" ")}
                  >
                    {t(`validity_${row.validity}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-lg border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide",
                      statusTone(row.status),
                    ].join(" ")}
                  >
                    {t(`status_${row.status}`)}
                  </span>
                </td>
                <td className="px-4 py-3 nx-type-mono text-[0.65rem] text-white/35">
                  {row.chainAnchor ? `${row.chainAnchor.slice(0, 14)}…` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {row.status === "ACTIVE" && row.validity === "VALID" ? (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onUnlock(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-50"
                      >
                        <LockOpen className="h-3 w-3" aria-hidden />
                        {busyId === row.id ? t("actionWorking") : t("actionUnlock")}
                      </button>
                    ) : null}
                    {row.status === "PENDING" ? (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onApprove(row.id)}
                        className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {busyId === row.id ? t("actionWorking") : t("actionApprove")}
                      </button>
                    ) : null}
                    {row.status !== "REVOKED" ? (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onRevoke(row.id)}
                        className="rounded-lg border border-rose-400/30 bg-rose-500/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-rose-100 transition hover:bg-rose-500/22 disabled:opacity-50"
                      >
                        {busyId === row.id ? t("actionWorking") : t("actionRevoke")}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
