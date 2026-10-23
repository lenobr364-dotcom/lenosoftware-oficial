import type { Metadata } from "next";
import { Activity, Beaker, Cpu, Key, Layers, Search, ShieldCheck } from "lucide-react";

import { getTranslations } from "next-intl/server";

import { LanguageSelector } from "@/components/LanguageSelector";

type ShowcaseFormula = {
  id: string;
  nameKey: "showcaseFormulaDetergente" | "showcaseFormulaDesengraxante" | "showcaseFormulaSanitizante" | "showcaseFormulaAditivo";
  categoryKey: "showcaseCategoryCleaners" | "showcaseCategoryAutomotive" | "showcaseCategoryDisinfectants" | "showcaseCategorySpecial";
  purity: string;
  status: "protected" | "review";
  licenses: number;
};

const showcaseFormulas: ShowcaseFormula[] = [
  { id: "CHEM-4029", nameKey: "showcaseFormulaDetergente", categoryKey: "showcaseCategoryCleaners", purity: "99.4%", status: "protected", licenses: 12 },
  { id: "CHEM-7712", nameKey: "showcaseFormulaDesengraxante", categoryKey: "showcaseCategoryAutomotive", purity: "98.7%", status: "protected", licenses: 8 },
  { id: "CHEM-1054", nameKey: "showcaseFormulaSanitizante", categoryKey: "showcaseCategoryDisinfectants", purity: "99.9%", status: "review", licenses: 4 },
  { id: "CHEM-3190", nameKey: "showcaseFormulaAditivo", categoryKey: "showcaseCategorySpecial", purity: "96.2%", status: "protected", licenses: 15 },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DigitalLaboratory" });
  return {
    title: `${t("title")} | Lumen Nexus`,
    description: t("subtitle"),
  };
}

export default async function DigitalLaboratoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  const t = await getTranslations("DigitalLaboratory");

  return (
    <div className="min-h-screen bg-[#0a0f0d] font-mono text-[#e2e8f0] selection:bg-[#10b981] selection:text-black">
      <header className="sticky top-0 z-50 flex flex-col items-start justify-between gap-4 border-b border-[#14291f] bg-[#0a0f0d]/80 px-6 pb-6 pt-3 backdrop-blur-md transition-all duration-300 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#10b981]">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#10b981]" aria-hidden />
            {t("labOperationalEyebrow")}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            ChemVault <span className="text-[#10b981]">{t("labLogoSuffix")}</span>
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">{t("labSubtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 rounded border border-[#14291f] bg-[#0f1712]/90 px-4 py-2 backdrop-blur">
            <Activity className="h-4 w-4 animate-pulse text-[#10b981]" aria-hidden />
            <span>
              {t("labEngineStatus")} <span className="font-bold text-[#10b981]">{t("labEngineOnline")}</span>
            </span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t("metricActiveFormulas")}
            value="142"
            hint={t("metricActiveFormulasHint")}
            hintAccent={false}
            icon={<Beaker className="h-4 w-4 text-[#10b981]" aria-hidden />}
          />
          <MetricCard
            label={t("metricGlobalSecurity")}
            value="HMAC-256"
            hint={t("metricGlobalSecurityHint")}
            hintAccent
            icon={<ShieldCheck className="h-4 w-4 text-[#10b981]" aria-hidden />}
          />
          <MetricCard
            label={t("metricActiveContracts")}
            value="39"
            hint={t("metricActiveContractsHint")}
            hintAccent={false}
            icon={<Key className="h-4 w-4 text-[#10b981]" aria-hidden />}
          />
          <MetricCard
            label={t("metricSimulationsPerSec")}
            value="2.4k"
            hint={t("metricSimulationsPerSecHint")}
            hintAccent={false}
            icon={<Cpu className="h-4 w-4 text-[#10b981]" aria-hidden />}
          />
        </div>

        <main className="overflow-hidden rounded border border-[#14291f] bg-[#0f1712] shadow-2xl">
          <div className="flex flex-col items-center justify-between gap-3 border-b border-[#14291f] bg-[#0c130f] p-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layers className="h-4 w-4 text-[#10b981]" aria-hidden />
              <span className="uppercase tracking-wider">{t("repoTitle")}</span>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="w-full rounded border border-[#14291f] bg-[#070b09] px-3 py-1.5 pl-8 text-xs text-white transition-colors focus:border-[#10b981] focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" aria-hidden />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#14291f] bg-[#0c130f] font-bold uppercase tracking-wider text-gray-400">
                  <th scope="col" className="whitespace-nowrap p-4">{t("tableColId")}</th>
                  <th scope="col" className="min-w-[250px] p-4">{t("tableColName")}</th>
                  <th scope="col" className="whitespace-nowrap p-4">{t("tableColCategory")}</th>
                  <th scope="col" className="whitespace-nowrap p-4 text-center">{t("tableColPurity")}</th>
                  <th scope="col" className="whitespace-nowrap p-4 text-center">{t("tableColContracts")}</th>
                  <th scope="col" className="whitespace-nowrap p-4 text-right">{t("tableColStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14291f]/40">
                {showcaseFormulas.map((formula) => (
                  <tr key={formula.id} className="group transition-colors hover:bg-[#121f18]/30">
                    <td className="whitespace-nowrap p-4 font-bold text-[#10b981]">{formula.id}</td>
                    <td className="p-4 font-semibold text-white transition-colors group-hover:text-[#10b981]">
                      {t(formula.nameKey)}
                    </td>
                    <td className="whitespace-nowrap p-4 text-gray-400">
                      <span className="rounded border border-[#14291f] bg-[#070b09] px-2 py-0.5 text-[11px]">
                        {t(formula.categoryKey)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-4 text-center font-bold text-[#10b981]">{formula.purity}</td>
                    <td className="whitespace-nowrap p-4 text-center font-bold text-white">{formula.licenses}</td>
                    <td className="whitespace-nowrap p-4 text-right">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          formula.status === "protected"
                            ? "border border-[#10b981]/30 bg-[#062419] text-[#10b981]"
                            : "border border-[#f59e0b]/30 bg-[#291e0a] text-[#f59e0b]"
                        }`}
                      >
                        {formula.status === "protected" ? t("statusProtected") : t("statusUnderReview")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500">
          <div>{t("footerProject")}</div>
          <div>{t("footerEncrypted", { year: new Date().getFullYear() })}</div>
        </footer>
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  hintAccent: boolean;
  icon: React.ReactNode;
};

function MetricCard({ label, value, hint, hintAccent, icon }: MetricCardProps) {
  return (
    <div className="rounded border border-[#14291f] bg-[#0f1712] p-4 transition-colors hover:border-[#10b981]/40">
      <div className="mb-2 flex items-start justify-between text-gray-400">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className={`mt-1 text-[10px] uppercase ${hintAccent ? "text-[#10b981]" : "text-gray-500"}`}>{hint}</div>
    </div>
  );
}
