import type { Route } from "next";
import Link from "next/link";

import { COPY_EN } from "@/lib/copy";

const formulas = [
  { id: "solupan", name: "Solupan" },
  { id: "detergente-neutro", name: "Detergente Neutro Premium" },
  { id: "desengraxante", name: "Desengraxante Industrial" },
  { id: "multiuso", name: "Limpador Multiuso Lux" },
  { id: "vidros", name: "Limpa Vidros Cristal" },
  { id: "clorado", name: "Alvejante Clorado Estável" },
  { id: "sanitizante", name: "Sanitizante de Superfícies" },
  { id: "perfume", name: "Essência / Perfume Concentrado" },
  { id: "amaciante", name: "Amaciante Ultra Macio" },
  { id: "desincrustante", name: "Desincrustante Ácido Controlado" },
  { id: "lava-roupas", name: "Lava-Roupas Líquido" },
  { id: "shampoo-auto", name: "Shampoo Automotivo" },
  { id: "neutralizador-odores", name: "Neutralizador de Odores" },
];

export default function DashboardPage() {
  const copy = COPY_EN;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.20),transparent_60%)] blur-2xl" />
        <div className="absolute -left-28 top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-[0_0_55px_rgba(255,215,0,0.12)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-yellow-300/80">
                Dashboard Profissional • Licenciamento Global
              </p>
              <h1
                className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl"
                style={{
                  textShadow:
                    "0 0 14px rgba(255,215,0,0.22), 0 0 36px rgba(255,215,0,0.12)",
                }}
              >
                {copy.Dashboard.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-gray-300 md:text-lg">
                {copy.Dashboard.welcome} • {copy.Dashboard.status}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-3xl border border-white/10 bg-black/60 px-5 py-4 text-sm text-gray-200 shadow-[0_0_40px_rgba(255,215,0,0.10)]">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Total de fórmulas</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formulas.length}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_55px_rgba(255,215,0,0.10)] backdrop-blur-2xl md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">Catálogo de Fórmulas</h2>
              <p className="mt-2 text-sm text-gray-300">
                Selecione um produto para abrir a calculadora e dimensionar o lote.
              </p>
            </div>
            <div className="text-xs uppercase tracking-[0.28em] text-gray-400">
              Glass • Blur • Luxury
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formulas.map((formula) => (
              <article
                key={formula.id}
                className="product-card group relative p-7 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.22),transparent_60%)] blur-2xl" />
                </div>

                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.34em] text-gray-400">Produto</p>
                  <h3 className="mt-4 text-xl font-semibold text-white md:text-2xl">
                    {formula.name}
                  </h3>

                  <div className="mt-7 flex items-center justify-between gap-4">
                    <div className="rounded-3xl border border-white/10 bg-black/60 px-4 py-2 text-xs text-gray-300">
                      ID: <span className="font-mono text-gray-200">{formula.id}</span>
                    </div>

                    <Link
                      href={`/en/dashboard/market-scalability` as Route}
                      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-400 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-yellow-300/30"
                    >
                      {copy.Labels.calc}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

