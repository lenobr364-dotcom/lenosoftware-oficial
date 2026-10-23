import { AssetDemandChart } from "@/app/components/AssetDemandChart";
import { LicenseLeadActionsMenu } from "@/app/components/LicenseLeadActionsMenu";
import { prisma } from "@/lib/prisma";
import { tableGlassBodyRow, tableGlassHeadRow, tableGlassWrap } from "@/lib/ui-glass";
import { getTranslations } from "next-intl/server";

function localeTag(locale: string): string {
  if (locale === "pt") return "pt-BR";
  if (locale === "de") return "de-DE";
  if (locale === "hi") return "hi-IN";
  return "en-US";
}

function statusBadge(status: string, td: (key: string) => string) {
  const s = status.trim();
  const u = s.toUpperCase();
  if (u === "PENDING" || s === "Pending" || s === "Pendente") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-amber-400">
        {td("leadStatusPending")}
      </span>
    );
  }
  if (s === "Em Análise") {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-sky-200/95 shadow-[0_0_20px_rgba(14,165,233,0.18)]">
        {td("leadStatusReview")}
      </span>
    );
  }
  if (s === "Aprovado" || u === "ACTIVE" || s === "Ativa") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-emerald-300/95 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
        {td("leadStatusActive")}
      </span>
    );
  }
  if (u === "REJECTED" || s === "Rejeitado") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-500/15 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-rose-300/95">
        {td("leadStatusRejected")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[0.6875rem] font-medium tracking-wide text-neutral-300">
      {status}
    </span>
  );
}

export async function ExecutiveLicensePanel({ locale }: { locale: string }) {
  const td = await getTranslations("Dashboard");

  const [rows, totalCount, activeCount, countryGroups] = await Promise.all([
    prisma.licenseRequest.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.licenseRequest.count(),
    prisma.licenseRequest.count({
      where: { OR: [{ status: "Aprovado" }, { status: "ACTIVE" }, { status: "Ativa" }] },
    }),
    prisma.licenseRequest.groupBy({
      by: ["country"],
      _count: { id: true },
    }),
  ]);

  const demandSeries = [...countryGroups]
    .sort((a, b) => b._count.id - a._count.id)
    .map((g) => ({
      name: g.country.trim() || td("chartDemandUnknownCountry"),
      count: g._count.id,
    }));

  const dateFmt = new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-amber-300/75">
          {td("executiveEyebrow")}
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">{td("executiveTitle")}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-400 sm:text-[0.9375rem]">{td("executiveSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-[0_0_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-80"
            aria-hidden
          />
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            {td("kpiTotalRequests")}
          </p>
          <p className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white tabular-nums sm:text-[2rem]">
            {String(totalCount)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{td("kpiTotalRequestsHint")}</p>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-[0_0_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-80"
            aria-hidden
          />
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            {td("kpiVolumeUsd")}
          </p>
          <p className="mt-4 font-sans text-3xl font-semibold tracking-tight text-neutral-500 tabular-nums sm:text-[2rem]">
            —
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{td("kpiVolumeUsdHint")}</p>
        </article>

        <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-[0_0_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-80"
            aria-hidden
          />
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            {td("kpiActiveLicenses")}
          </p>
          <p className="mt-4 font-sans text-3xl font-semibold tracking-tight text-white tabular-nums sm:text-[2rem]">
            {String(activeCount)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{td("kpiActiveLicensesHint")}</p>
        </article>
      </div>

      <AssetDemandChart
        data={demandSeries}
        title={td("chartDemandTitle")}
        subtitle={td("chartDemandSubtitle")}
        emptyHint={td("chartDemandEmpty")}
        tooltipRequestsLabel={td("chartTooltipRequests")}
      />

      <div className="overflow-hidden rounded-[1.75rem] border border-white/[0.11] bg-white/[0.04] shadow-[0_0_60px_rgba(251,191,36,0.1)] backdrop-blur-2xl ring-1 ring-white/[0.05]">
        <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{td("leadsTitle")}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{td("leadsSubtitle")}</p>
        </div>

        <div className="p-3 sm:p-4">
        <div className={`overflow-x-auto ${tableGlassWrap}`}>
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className={tableGlassHeadRow}>
                <th className="whitespace-nowrap px-5 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:px-8">
                  {td("colLeadDate")}
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  {td("colLeadCorp")}
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  {td("colLeadCountry")}
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  {td("colLeadEmail")}
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:px-8">
                  {td("colLeadStatus")}
                </th>
                <th className="whitespace-nowrap px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-neutral-500 sm:px-8">
                  {td("colLeadActions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center sm:px-8">
                    <p className="text-sm font-medium tracking-tight text-neutral-400">{td("leadsEmpty")}</p>
                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-neutral-600">{td("leadsEmptyHint")}</p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`${tableGlassBodyRow} last:border-b-0`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm tabular-nums text-neutral-300 sm:px-8 sm:py-[1.125rem]">
                      {dateFmt.format(row.createdAt)}
                    </td>
                    <td className="max-w-[220px] px-4 py-4 text-sm font-medium leading-snug tracking-[-0.01em] text-white/95 sm:max-w-[280px] sm:py-[1.125rem]">
                      {row.company}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-neutral-400 sm:py-[1.125rem]">{row.country}</td>
                    <td className="max-w-[240px] px-4 py-4 text-sm leading-snug text-amber-100/90 sm:py-[1.125rem]">{row.corporateEmail}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right sm:px-8 sm:py-[1.125rem]">{statusBadge(row.status, td)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right sm:px-8 sm:py-[1.125rem]">
                      <LicenseLeadActionsMenu
                        leadId={row.id}
                        labels={{
                          trigger: td("leadActionsTrigger"),
                          menuAria: td("leadActionsMenuAria"),
                          markPending: td("actionMarkPending"),
                          approve: td("actionApproveLicense"),
                          reject: td("actionRejectArchive"),
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </section>
  );
}
