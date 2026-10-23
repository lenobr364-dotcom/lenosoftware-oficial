"use client";

import { updateLicenseRequestStatus, type LicenseRequestStatusAction } from "@/actions/license";
import { tableGlassBodyRow, tableGlassHeadRow } from "@/lib/ui-glass";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";

export type LeadRowSerializable = {
  id: string;
  company: string;
  country: string;
  corporateEmail: string;
  status: string;
  createdAt: string;
};

const MAIN_PIPELINE: Exclude<LicenseRequestStatusAction, "REJECTED">[] = ["Pendente", "Em Análise", "Aprovado"];

function normalizePipelineStatus(raw: string): LicenseRequestStatusAction {
  const s = raw.trim();
  if (s === "Pendente" || s === "Pending" || s === "PENDING") return "Pendente";
  if (s === "Em Análise") return "Em Análise";
  if (s === "Aprovado" || s === "ACTIVE" || s === "Ativa") return "Aprovado";
  if (s === "REJECTED" || s === "Rejeitado") return "REJECTED";
  return "Pendente";
}

function labelKeyForStatus(value: LicenseRequestStatusAction): string {
  switch (value) {
    case "Pendente":
      return "leadsPipelinePendente";
    case "Em Análise":
      return "leadsPipelineReview";
    case "Aprovado":
      return "leadsPipelineAprovado";
    case "REJECTED":
      return "leadsPipelineRejected";
    default:
      return "leadsPipelinePendente";
  }
}

function buttonClassForStatus(
  target: Exclude<LicenseRequestStatusAction, "REJECTED">,
  current: LicenseRequestStatusAction,
  loading: boolean,
): string {
  const isActive = current === target;
  const base = [
    "inline-flex shrink-0 items-center justify-center rounded-xl px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-all duration-200",
    "border backdrop-blur-md",
    loading ? "cursor-wait opacity-60" : "cursor-pointer disabled:cursor-default",
  ];

  if (isActive) {
    if (target === "Pendente") {
      return [...base, "border-amber-400/45 bg-amber-500/20 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]"].join(" ");
    }
    if (target === "Em Análise") {
      return [...base, "border-sky-400/45 bg-sky-500/20 text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.18)]"].join(" ");
    }
    return [...base, "border-emerald-400/45 bg-emerald-500/20 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]"].join(" ");
  }

  return [
    ...base,
    "border-white/10 bg-white/[0.04] text-neutral-400",
    loading ? "" : "hover:border-white/20 hover:bg-white/[0.08] hover:text-neutral-200 active:scale-[0.98]",
  ].join(" ");
}

export function LeadsManagementTable({ rows, locale }: { rows: LeadRowSerializable[]; locale: string }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-US",
        { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
      ),
    [locale],
  );

  function applyStatus(leadId: string, next: LicenseRequestStatusAction) {
    setBusyId(leadId);
    startTransition(() => {
      void (async () => {
        const result = await updateLicenseRequestStatus(leadId, next);
        setBusyId(null);
        if (result.ok) {
          router.refresh();
          return;
        }
        if (result.error === "Unauthorized.") {
          router.push("/login");
          router.refresh();
        }
      })();
    });
  }

  const tableWrap = [
    "overflow-hidden rounded-[1.75rem]",
    "border border-white/[0.12] bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-black/45",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_48px_rgba(251,191,36,0.08)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/[0.06]",
  ].join(" ");

  if (rows.length === 0) {
    return (
      <div className={`${tableWrap} px-8 py-20 text-center`}>
        <p className="text-sm font-medium text-neutral-300">{t("leadsEmpty")}</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-500">{t("leadsEmptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={tableWrap}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">{t("leadsTableCaption")}</caption>
          <thead>
            <tr className={tableGlassHeadRow}>
              <th className="whitespace-nowrap px-5 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500 sm:px-7">
                {t("leadsColCompany")}
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {t("leadsColCountry")}
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {t("leadsColEmail")}
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {t("leadsColDate")}
              </th>
              <th className="min-w-[280px] px-5 py-4 text-right text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-500 sm:px-7">
                {t("leadsColStatus")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const normalized = normalizePipelineStatus(row.status);
              const loading = isPending && busyId === row.id;
              const isArchived = normalized === "REJECTED";

              return (
                <tr
                  key={row.id}
                  className={`${tableGlassBodyRow} last:border-b-0`}
                >
                  <td className="max-w-[240px] px-5 py-4 text-sm font-medium leading-snug text-white/95 sm:px-7 sm:py-5">
                    {row.company}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-400 sm:py-5">{row.country}</td>
                  <td className="max-w-[220px] px-4 py-4 text-sm leading-snug text-amber-100/85 sm:py-5">{row.corporateEmail}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm tabular-nums text-neutral-400 sm:py-5">
                    {dateFmt.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-5 py-4 sm:px-7 sm:py-5">
                    <div
                      className="flex flex-col items-stretch gap-2 sm:ml-auto sm:max-w-md sm:items-end"
                      role="group"
                      aria-label={t("leadsSelectAria", { company: row.company })}
                    >
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {loading ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-300/80" aria-hidden />
                        ) : null}
                        {MAIN_PIPELINE.map((target) => {
                          const active = normalized === target;
                          return (
                            <button
                              key={target}
                              type="button"
                              disabled={loading || active}
                              aria-pressed={active}
                              aria-busy={loading}
                              onClick={() => applyStatus(row.id, target)}
                              className={buttonClassForStatus(target, normalized, loading)}
                            >
                              {t(labelKeyForStatus(target))}
                            </button>
                          );
                        })}
                      </div>
                      {isArchived ? (
                        <p className="text-right text-[0.65rem] font-medium uppercase tracking-[0.14em] text-rose-300/80">
                          {t("leadsArchivedRowHint")}
                        </p>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
