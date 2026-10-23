"use client";

import type { GatewayAccessLogEntry } from "@/lib/gateway/types";
import { useLocale, useTranslations } from "next-intl";

type GlassAccessLogsTableProps = {
  rows: GatewayAccessLogEntry[];
};

function statusTone(status: number): string {
  if (status >= 500) return "from-rose-500/30 to-red-500/10 text-rose-100 border-rose-400/30";
  if (status >= 400) return "from-amber-500/25 to-orange-500/10 text-amber-100 border-amber-400/25";
  return "from-emerald-500/25 to-cyan-500/10 text-emerald-100 border-emerald-400/25";
}

export function GlassAccessLogsTable({ rows }: GlassAccessLogsTableProps) {
  const t = useTranslations("ApiIntegration");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white/85">{t("logsTitle")}</p>
        <p className="text-xs text-white/40">{t("logsSubtitle")}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colTime")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colKey")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colRequest")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colStatus")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colLatency")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colIp")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                  {t("emptyLogs")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5 text-xs text-white/50">
                    {new Date(row.at).toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-2.5 nx-type-mono text-xs text-cyan-100/60">{row.keyPrefix}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[0.65rem] font-bold uppercase text-violet-200/80">{row.method}</span>
                    <span className="ml-2 nx-type-mono text-xs text-white/70">{row.path}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={[
                        "inline-flex rounded-md border bg-gradient-to-br px-2 py-0.5 text-xs font-semibold",
                        statusTone(row.status),
                      ].join(" ")}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-white/45">{row.latencyMs} ms</td>
                  <td className="px-4 py-2.5 text-xs text-white/35">{row.ipHint}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
