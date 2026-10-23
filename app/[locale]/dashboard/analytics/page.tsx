import { AnalyticsPageClient } from "@/components/analytics/AnalyticsPageClient";
import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { computeFinanceKpis, FORMULAS, profitPerLiter } from "@/lib/formulas";
import { getTranslations } from "next-intl/server";

export default async function MarketAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Dashboard");
  const kpis = computeFinanceKpis(FORMULAS);
  const chartRows = FORMULAS.map((f) => ({
    name: f.name,
    cost: f.costPerLiter,
    profit: profitPerLiter(f),
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="analytics" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 transition-all duration-300 ease-out hover:border-cyan-400/35 hover:bg-cyan-500/10 hover:text-cyan-100"
            >
              ← {t("analyticsBack")}
            </Link>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-400 transition hover:border-emerald-500/30 hover:text-emerald-100/90"
            >
              {t("navVaultHome")}
            </Link>
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-400/70">{t("analyticsLive")}</p>
        </div>

        <AnalyticsPageClient locale={locale} kpis={kpis} chartRows={chartRows} />
      </div>
    </main>
  );
}
