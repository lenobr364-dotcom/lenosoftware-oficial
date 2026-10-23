"use client";

import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import type { LicensingContractRow } from "@/lib/contracts/types";
import { useLocale, useTranslations } from "next-intl";

type GlassContractsTableProps = {
  rows: LicensingContractRow[];
  selectedId: string | null;
  onSelect: (row: LicensingContractRow) => void;
};

export function GlassContractsTable({ rows, selectedId, onSelect }: GlassContractsTableProps) {
  const t = useTranslations("LicensingContracts");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04]">
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colClient")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colSubject")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colType")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colStatus")}
              </th>
              <th className="px-4 py-3 text-[0.62rem] font-semibold uppercase tracking-wider text-white/45">
                {t("colValidity")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                  {t("emptyTable")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const selected = selectedId === row.id;
                return (
                  <tr
                    key={`${row.kind}:${row.id}`}
                    className={[
                      "cursor-pointer border-b border-white/[0.06] transition",
                      selected
                        ? "bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-transparent"
                        : "hover:bg-white/[0.04]",
                    ].join(" ")}
                    onClick={() => onSelect(row)}
                  >
                    <td className="px-4 py-3 font-medium text-white/90">{row.clientLabel}</td>
                    <td className="px-4 py-3 nx-type-mono text-xs text-white/55">{row.formulaOrCompany}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {row.kind === "industrial_grant" ? t("typeGrant") : t("typeRequest")}
                    </td>
                    <td className="px-4 py-3">
                      <ContractStatusBadge status={row.displayStatus} />
                    </td>
                    <td className="px-4 py-3 text-xs text-white/45">
                      {row.validUntil
                        ? new Date(row.validUntil).toLocaleDateString(locale)
                        : t(`validity_${row.validityKey}`)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
