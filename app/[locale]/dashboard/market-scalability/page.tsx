import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { MarketScalabilitySim, type ScalabilityFormulaRow } from "@/app/components/MarketScalabilitySim";
import { Link } from "@/i18n/navigation";
import { economicsForFormulaTitle } from "@/lib/market-scalability-economics";
import { parseProductLine } from "@/lib/product-line";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function MarketScalabilityPage() {
  const t = await getTranslations("Dashboard.marketScalability");
  const td = await getTranslations("Dashboard");

  let rows: ScalabilityFormulaRow[] = [];
  try {
    const raw = await prisma.formula.findMany({ orderBy: { nome: "asc" } });
    rows = raw.map((r) => {
      const line = parseProductLine(r.categoria, r.nome);
      const e = economicsForFormulaTitle(r.nome, line);
      return {
        id: r.id,
        title: r.nome,
        productLine: line,
        costPerLiterBrl: e.costPerLiterBrl,
        suggestedPricePerLiterBrl: e.suggestedPricePerLiterBrl,
        referenceBatchLiters: e.referenceBatchLiters,
      };
    });
  } catch {
    rows = [];
  }

  const first = rows[0];
  let defaultMarginPercent = 38;
  if (first && first.costPerLiterBrl > 0) {
    defaultMarginPercent =
      Math.round(((first.suggestedPricePerLiterBrl - first.costPerLiterBrl) / first.costPerLiterBrl) * 1000) / 10;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="dashboard" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header
          className={[
            "rounded-[2.5rem] border border-white/10 p-7 shadow-[0_0_55px_rgba(255,215,0,0.1)] backdrop-blur-2xl md:p-9",
            "bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-black/50",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 transition hover:border-yellow-500/35 hover:bg-yellow-500/10 hover:text-yellow-100"
            >
              ← {td("analyticsBack")}
            </Link>
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-400 transition hover:border-emerald-500/30 hover:text-emerald-100/90"
            >
              {td("navVaultHome")}
            </Link>
          </div>
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-300/75">{t("pageEyebrow")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style={{ textShadow: "0 0 14px rgba(255,215,0,0.16)" }}>
            {t("pageTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">{t("pageLead")}</p>
        </header>

        <MarketScalabilitySim formulas={rows} defaultMarginPercent={defaultMarginPercent} />
      </div>
    </main>
  );
}
