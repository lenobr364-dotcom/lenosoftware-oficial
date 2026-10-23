"use client";

import type { ApiKeyPublicRow, ApiKeyScope } from "@/lib/gateway/types";

const SCOPE_I18N: Record<ApiKeyScope, string> = {
  "read:health": "scopeReadHealth",
  "read:openapi": "scopeReadOpenapi",
  "read:formulas": "scopeReadFormulas",
  "read:analytics": "scopeReadAnalytics",
  "read:licensing": "scopeReadLicensing",
};
import { useLocale, useTranslations } from "next-intl";

type GlassApiKeysTableProps = {
  rows: ApiKeyPublicRow[];
  busyId: string | null;
  onRevoke: (row: ApiKeyPublicRow) => void;
};

function statusClass(status: ApiKeyPublicRow["status"]): string {
  if (status === "active") {
    return "bg-gradient-to-r from-emerald-500/25 to-cyan-500/15 text-emerald-100 border-emerald-400/30";
  }
  return "bg-gradient-to-r from-rose-500/20 to-orange-500/10 text-rose-100/90 border-rose-400/25";
}

export function GlassApiKeysTable({ rows, busyId, onRevoke }: GlassApiKeysTableProps) {
  const t = useTranslations("ApiIntegration");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colLabel")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colPrefix")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colScopes")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colStatus")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colUsage")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colActions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  {t("emptyKeys")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06] hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white/90">{row.label}</td>
                  <td className="px-4 py-3 nx-type-mono text-xs text-cyan-100/70">{row.prefix}</td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {row.scopes.map((s) => t(SCOPE_I18N[s])).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
                        statusClass(row.status),
                      ].join(" ")}
                    >
                      {t(`status_${row.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/45">
                    {row.requestCount} ·{" "}
                    {row.lastUsedAt
                      ? new Date(row.lastUsedAt).toLocaleString(locale)
                      : t("neverUsed")}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "active" ? (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onRevoke(row)}
                        className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-100/90 backdrop-blur-md transition hover:bg-rose-500/20 disabled:opacity-50"
                      >
                        {busyId === row.id ? t("revoking") : t("revokeKey")}
                      </button>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
