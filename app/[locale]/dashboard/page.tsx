import { ChemVaultCommandStrip } from "@/app/components/ChemVaultCommandStrip";
import { DashboardGridSkeleton } from "@/app/components/dashboard/DashboardGridSkeleton";
import { DashboardLicenseTrendSection } from "@/components/dashboard/DashboardLicenseTrendSection";
import { DashboardQuickModules } from "@/components/dashboard/DashboardQuickModules";
import { SalesActivityFeed } from "@/app/components/dashboard/SalesActivityFeed";
import { ChemVaultCommandStripSkeleton } from "@/app/components/skeletons/glass-skeleton";
import { SecurityPanel } from "@/components/SecurityPanel";
import { Link } from "@/i18n/navigation";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { FORMULAS_CATALOG } from "@/lib/formulas-catalog";
import { redirect } from "next/navigation";

import { DashboardFormulasSection } from "./DashboardFormulasSection";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

type ElementBadge = { sym: string; z: number };

const CUSTODY_ELEMENTS: Record<string, ElementBadge[]> = {
  "arla-32": [
    { sym: "C", z: 6 },
    { sym: "H", z: 1 },
    { sym: "O", z: 8 },
  ],
  solupan: [
    { sym: "Na", z: 11 },
    { sym: "O", z: 8 },
    { sym: "S", z: 16 },
  ],
  intercap: [
    { sym: "N", z: 7 },
    { sym: "C", z: 6 },
    { sym: "Si", z: 14 },
  ],
};

const BLINDAGEM_LAYER_PCT = [
  { label: "Criptografia em repouso", value: 94 },
  { label: "Controle de acesso (RBAC)", value: 89 },
  { label: "Integridade & hashing", value: 91 },
  { label: "Trilho de auditoria", value: 86 },
];

function ElementTile({ sym, z }: ElementBadge) {
  return (
    <div className="flex h-[3.35rem] w-[3.35rem] flex-col items-center justify-center rounded-xl border border-amber-400/35 bg-gradient-to-b from-amber-500/18 via-white/[0.06] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <span className="leading-none text-[9px] font-semibold uppercase tracking-wider text-amber-200/75 tabular-nums">{z}</span>
      <span className="mt-0.5 text-[15px] font-black tracking-tight text-amber-50">{sym}</span>
    </div>
  );
}

function CustodyShieldLevel() {
  const overall = 92;
  return (
    <div id="blindagem-dados" className="scroll-mt-24 rounded-3xl border border-yellow-500/15 bg-white/5 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500/80">Cofre protegido</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Nível de Blindagem dos Dados</h2>
          <p className="mt-2 max-w-md text-sm text-gray-400">Indicadores internos combinados sobre criptografia, acesso e rastreabilidade.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" aria-hidden />
          Operacional
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,minmax(0,220px)] lg:items-end">
        <div>
          <div className="flex items-end justify-between gap-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-gray-500">Índice composto</p>
            <p className="text-4xl font-black tracking-tighter text-transparent tabular-nums bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-600 bg-clip-text">{overall}%</p>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full border border-yellow-500/20 bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.65)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-900/90 via-yellow-600/95 to-yellow-300/85 shadow-[0_0_24px_rgba(234,179,8,0.35)] transition-[width] duration-700"
              style={{ width: `${overall}%` }}
              role="progressbar"
              aria-valuenow={overall}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="hidden h-[6.5rem] items-end justify-center gap-1.5 lg:flex" aria-hidden>
          {[42, 68, 52, 92, 58, 78, 48].map((px, i) => (
            <div
              key={i}
              className="w-2.5 rounded-md border border-yellow-400/25 bg-gradient-to-t from-yellow-900/80 to-yellow-400/60"
              style={{ height: `${px}px` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {BLINDAGEM_LAYER_PCT.map((layer) => (
          <div key={layer.label}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-gray-300">{layer.label}</p>
              <p className="text-xs tabular-nums text-amber-200/95">{layer.value}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-700/95 via-yellow-400/95 to-yellow-200/85"
                style={{ width: `${layer.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function categoryForFormula(id: string) {
  const map: Record<string, string> = {
    "arla-32": "Tensoativos & Soluções Aquosas",
    solupan: "Desengordurantes Alcalinos",
    intercap: "Encapsulamento & Polímeros Funcionais",
  };
  return map[id] ?? "Especialidades Químicas";
}

function licenseLabel(license: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  switch (license) {
    case "active":
      return t("licenseActive");
    case "renewal":
      return t("licenseRenewal");
    case "pending":
      return t("licensePending");
    default:
      return license;
  }
}

function licenseBadgeClass(license: string) {
  switch (license) {
    case "active":
      return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
    case "renewal":
      return "border-amber-400/40 bg-amber-500/12 text-amber-200";
    case "pending":
      return "border-rose-400/30 bg-rose-500/10 text-rose-200";
    default:
      return "border-white/15 bg-white/5 text-gray-300";
  }
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations({ locale, namespace: "Dashboard" });

  const totalLicensed = FORMULAS_CATALOG.length;
  const recent = [...FORMULAS_CATALOG]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 6);

  return (
    <div className="min-h-screen px-5 py-8 text-white sm:px-6 md:px-10 md:py-10">
      <main className="relative mx-auto max-w-7xl">
        <section className="space-y-8 rounded-[1.85rem] border border-yellow-500/10 bg-white/[0.035] px-4 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6 md:space-y-10 md:px-8 md:py-12">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]/90 shadow-[0_0_0_3px_rgba(212,175,55,0.12)]" />
                  Área interna · acesso autenticado
                </p>
                <h1 className="mt-3 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-3xl font-black uppercase italic tracking-tighter text-transparent sm:text-4xl">
                  {t("homeHeroTitle")} <span className="text-amber-500">{t("homeHeroAccent")}</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-400">{t("homeHeroTagline")}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">Leno César</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#D4AF37]">{t("homeSessionTier")}</p>
              </div>
            </header>

            <DashboardQuickModules />

            <section aria-labelledby="inventario-heading" className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="inventario-heading" className="text-lg font-semibold text-white">
                    Inventário de Fórmulas
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">Cards licenciados com acesso direto à visualização técnica.</p>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-500">{totalLicensed} licenciadas</p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {FORMULAS_CATALOG.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_14px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:border-[#D4AF37]/20 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Fórmula licenciada</p>
                        <p className="mt-2 text-lg font-semibold text-white">{f.name}</p>
                        <p className="mt-1 font-mono text-xs text-gray-500">{f.code}</p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                          licenseBadgeClass(f.license),
                        ].join(" ")}
                      >
                        {licenseLabel(f.license, t)}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex gap-2" aria-hidden>
                        {(CUSTODY_ELEMENTS[f.id] ?? [
                          { sym: "C", z: 6 },
                          { sym: "O", z: 8 },
                        ]).slice(0, 2).map((e) => (
                          <ElementTile key={`${f.id}-mini-${e.sym}-${e.z}`} sym={e.sym} z={e.z} />
                        ))}
                      </div>

                      <Link
                        href={`/dashboard/formula/${f.id}?view=molecule`}
                        className="inline-flex items-center justify-center rounded-2xl border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37] shadow-[0_0_0_1px_rgba(212,175,55,0.06)] transition hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/15 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25"
                      >
                        Visualizar Molécula
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Total de Fórmulas Licenciadas</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-white tabular-nums">{totalLicensed}</p>
                <p className="mt-2 text-sm text-gray-400">Catálogo interno com rastreio e auditoria.</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <svg className="h-5 w-5 text-amber-300/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 2 4 7v6c0 5 3.3 9.4 8 10 4.7-.6 8-5 8-10V7l-8-5Z" />
                  <path d="M9 12l2 2 4-5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Status de Segurança da Blindagem</p>
                <p className="mt-3 text-lg font-semibold text-white">Blindagem ativa</p>
                <p className="mt-2 text-sm text-gray-400">Dados sob custódia com múltiplas camadas técnicas e legais.</p>
              </div>
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 blur-[0.5px]" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.10)]" aria-hidden />
                  <span className="sr-only">Proteção ativa</span>
                </div>
              </div>
            </div>
            <a
              href="#blindagem-dados"
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/95 transition hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:rounded"
            >
              Ver nível de blindagem dos dados
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Acesso Rápido ao Cofre</p>
                <p className="mt-3 text-lg font-semibold text-white">Inventário de fórmulas</p>
                <p className="mt-2 text-sm text-gray-400">Abra o cofre para ver, filtrar e consultar detalhes.</p>
              </div>
              <a
                href="#cofre"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.06)] transition hover:border-amber-300/45 hover:bg-amber-500/15 focus:outline-none focus:ring-2 focus:ring-amber-300/25"
              >
                Abrir
              </a>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Últimas revisões</p>
              <p className="mt-2 text-sm text-gray-300">
                {recent[0]?.name ?? "—"} · {recent[0]?.code ?? "—"}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="custodia-heading">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-500/75">Custódia técnica</p>
              <h2 id="custodia-heading" className="mt-1 text-lg font-semibold text-white">
                Fórmulas Sob Custódia
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Fichas sob bloqueio operacional — assinatura química por elementos representativos da matriz licenciada.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400">
              {totalLicensed} ativos no cofre
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FORMULAS_CATALOG.map((f) => {
              const els = CUSTODY_ELEMENTS[f.id] ?? [
                { sym: "C", z: 6 },
                { sym: "O", z: 8 },
              ];
              return (
                <Link
                  key={f.id}
                  href={`/dashboard/formula/${f.id}`}
                  className="group block rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_14px_44px_rgba(0,0,0,0.5)] backdrop-blur-md outline-none transition hover:border-yellow-400/25 hover:bg-white/[0.07] hover:shadow-[0_18px_50px_rgba(0,0,0,0.55)] focus-visible:ring-2 focus-visible:ring-yellow-400/35"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-2">
                      {els.map((e) => (
                        <ElementTile key={`${f.id}-${e.sym}-${e.z}`} sym={e.sym} z={e.z} />
                      ))}
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        licenseBadgeClass(f.license),
                      ].join(" ")}
                    >
                      {licenseLabel(f.license, t)}
                    </span>
                  </div>
                  <p className="mt-5 font-semibold text-white transition group-hover:text-amber-100">{f.name}</p>
                  <p className="mt-1 font-mono text-xs text-gray-500">{f.code}</p>
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-400/80 opacity-90 transition group-hover:opacity-100">
                    Abrir ficha segura →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <CustodyShieldLevel />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <Suspense
              fallback={
                <div className="h-56 animate-pulse rounded-2xl bg-white/[0.04]" aria-hidden />
              }
            >
              <DashboardLicenseTrendSection />
            </Suspense>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <SalesActivityFeed locale={locale} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Fórmulas Recentes</h2>
              <p className="mt-1 text-sm text-gray-400">Visão rápida do cofre: categoria química e status de licenciamento.</p>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">Atualizado automaticamente</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                    Nome da Fórmula
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                    Categoria Química
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200/90">
                    Status do Licenciamento
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-white/10 bg-white/[0.02] transition hover:bg-white/[0.04]">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-white">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.code}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200">
                        {categoryForFormula(row.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                          licenseBadgeClass(row.license),
                        ].join(" ")}
                      >
                        {licenseLabel(row.license, t)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="cofre" className="scroll-mt-24">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Cofre de Fórmulas</h2>
              <p className="mt-1 text-sm text-gray-400">Inventário completo com navegação e controles avançados.</p>
            </div>
            <p className="hidden text-xs font-medium uppercase tracking-[0.22em] text-gray-600 sm:block">
              Leno César &amp; Lumen Onel
            </p>
          </div>

          <Suspense fallback={<ChemVaultCommandStripSkeleton />}>
            <ChemVaultCommandStrip />
          </Suspense>
          <div className="mt-6">
            <Suspense fallback={<DashboardGridSkeleton />}>
              <DashboardFormulasSection />
            </Suspense>
          </div>
        </section>

        <div className="mt-10 md:mt-12">
          <SecurityPanel />
        </div>

            <footer className="rounded-2xl border border-white/10 bg-black/25 px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl md:px-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/90">ChemVault Global</p>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.42em] text-gray-600">Interface interna do cofre</p>
              <p className="mt-8 text-[11px] text-gray-500">
                Custódia, blindagem de dados e licenciamento são responsabilidades contínuas da plataforma.
              </p>
              <p className="mt-5 text-[11px] font-medium tracking-[0.24em] text-gray-600">Leno César &amp; Lumen Onel</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-gray-700">Cofre proprietário © {new Date().getFullYear()}</p>
            </footer>
        </section>
      </main>
    </div>
  );
}
