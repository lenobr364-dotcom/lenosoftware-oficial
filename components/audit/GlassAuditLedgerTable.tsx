"use client";

import type { AuditLedgerEntry, AuditOutcome, AuditSeverity } from "@/lib/audit/types";
import { useLocale, useTranslations } from "next-intl";

type GlassAuditLedgerTableProps = {
  rows: AuditLedgerEntry[];
  loading?: boolean;
};

function severityTone(severity: AuditSeverity): string {
  if (severity === "critical") {
    return "border-rose-400/35 bg-rose-500/15 text-rose-100 backdrop-blur-md";
  }
  if (severity === "warning") {
    return "border-amber-400/30 bg-amber-500/12 text-amber-100 backdrop-blur-md";
  }
  return "border-cyan-400/25 bg-cyan-500/10 text-cyan-100 backdrop-blur-md";
}

function outcomeTone(outcome: AuditOutcome): string {
  if (outcome === "blocked") return "border-orange-400/30 bg-orange-500/12 text-orange-100 backdrop-blur-md";
  if (outcome === "failure") return "border-rose-400/30 bg-rose-500/12 text-rose-100 backdrop-blur-md";
  return "border-emerald-400/28 bg-emerald-500/10 text-emerald-100 backdrop-blur-md";
}

function formatEventMessage(
  t: ReturnType<typeof useTranslations<"AuditTrail">>,
  row: AuditLedgerEntry,
): string {
  const params = row.messageParams ?? {};
  const key = `event.${row.messageKey}` as Parameters<typeof t>[0];
  return t(key, params as Record<string, string | number>);
}

export function GlassAuditLedgerTable({ rows, loading }: GlassAuditLedgerTableProps) {
  const t = useTranslations("AuditTrail");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-white/90">{t("tableTitle")}</p>
        <p className="text-xs text-white/40">{t("tableSubtitle")}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm" aria-busy={loading}>
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45 sm:px-5">
                {t("colTimestamp")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colCategory")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colEvent")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colResource")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colActor")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colSeverity")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colOutcome")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`sk_${i}`} className="border-b border-white/[0.05]">
                    <td colSpan={7} className="px-5 py-3">
                      <div className="h-9 animate-pulse rounded-xl bg-white/[0.06]" />
                    </td>
                  </tr>
                ))
              : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-sm text-white/40">
                  {t("emptyLedger")}
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/[0.06] bg-white/[0.02] transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <td className="px-4 py-3 text-xs tabular-nums text-white/50 sm:px-5">
                  {new Date(row.at).toLocaleString(locale, {
                    dateStyle: "short",
                    timeStyle: "medium",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-200/85">
                    {t(`category_${row.category}`)}
                  </span>
                </td>
                <td className="max-w-[240px] px-4 py-3 text-xs leading-relaxed text-white/75">
                  {formatEventMessage(t, row)}
                  {row.region ? (
                    <span className="mt-1 block text-[0.65rem] uppercase tracking-wider text-white/35">
                      {t("regionTag", { region: row.region })}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 nx-type-mono text-xs text-cyan-100/65">{row.resource}</td>
                <td className="px-4 py-3 text-xs text-white/40">{row.actorHint}</td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-lg border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
                      severityTone(row.severity),
                    ].join(" ")}
                  >
                    {t(`severity_${row.severity}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-lg border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
                      outcomeTone(row.outcome),
                    ].join(" ")}
                  >
                    {t(`outcome_${row.outcome}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
