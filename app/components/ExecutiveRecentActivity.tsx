import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Beaker, Inbox } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ProductLine } from "@/lib/product-line";

function localeTag(locale: string): string {
  if (locale === "pt") return "pt-BR";
  if (locale === "de") return "de-DE";
  if (locale === "hi") return "hi-IN";
  return "en-US";
}

function productLineKey(line: ProductLine): "productLineAutomotive" | "productLineBarSoap" | "productLineGeneralCleaning" {
  switch (line) {
    case "AUTOMOTIVE":
      return "productLineAutomotive";
    case "BAR_SOAP":
      return "productLineBarSoap";
    case "GENERAL_CLEANING":
      return "productLineGeneralCleaning";
  }
}

const panel = [
  "rounded-[1.75rem] border border-white/[0.08]",
  "bg-gradient-to-br from-white/[0.05] via-black/40 to-black/70",
  "p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6",
].join(" ");

export async function ExecutiveRecentActivity({
  locale,
  recentFormulas,
  recentLeads,
}: {
  locale: string;
  recentFormulas: { id: string; title: string; productLine: ProductLine; createdAt: Date }[];
  recentLeads: { id: string; company: string; country: string; status: string; createdAt: Date }[];
}) {
  const t = await getTranslations("Dashboard.executiveOverview");
  const td = await getTranslations("Dashboard");

  const df = new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      className={[
        "rounded-[2.25rem] border border-white/10",
        "bg-gradient-to-br from-white/[0.04] via-black/45 to-black/80 p-6 shadow-[0_0_48px_rgba(34,211,238,0.06)] backdrop-blur-2xl sm:p-8 md:p-10",
      ].join(" ")}
    >
      <div className="border-b border-white/[0.07] pb-6">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">{t("activityEyebrow")}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">{t("activityTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">{t("activitySubtitle")}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-cyan-300/80" aria-hidden />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-200">{t("activityFormulasTitle")}</h3>
            </div>
            <Link
              href="/dashboard/market-scalability"
              className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cyan-300/90 transition hover:text-cyan-100"
            >
              {t("activitySimulatorCta")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {recentFormulas.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">{t("activityFormulasEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.06]">
              {recentFormulas.map((row) => (
                <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 py-3.5 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white/95">{row.title}</p>
                    <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-amber-200/70">
                      {td(productLineKey(row.productLine))}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-neutral-500">{t("activityFormulasUpdated", { time: df.format(row.createdAt) })}</p>
                  </div>
                  <Link
                    href="/dashboard#vault-formulations"
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-neutral-300 transition hover:border-cyan-400/30 hover:text-cyan-100"
                  >
                    {t("activityOpenVault")}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[0.65rem] leading-relaxed text-neutral-600">{t("activityFormulasFootnote")}</p>
        </div>

        <div className={panel}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber-300/85" aria-hidden />
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-200">{t("activityLeadsTitle")}</h3>
            </div>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-200/90 transition hover:text-amber-50"
            >
              {t("activityLeadsCta")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">{t("activityLeadsEmpty")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.06]">
              {recentLeads.map((row) => (
                <li key={row.id} className="py-3.5 first:pt-0">
                  <p className="font-medium text-white/95">{row.company}</p>
                  <p className="mt-0.5 text-[0.75rem] text-neutral-400">
                    {row.country} · <span className="text-neutral-500">{row.status}</span>
                  </p>
                  <p className="mt-1 text-[0.7rem] text-neutral-500">{df.format(row.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
