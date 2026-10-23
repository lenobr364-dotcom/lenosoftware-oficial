import { BijuTechTelemetryPanel } from "@/app/components/BijuTechTelemetryPanel";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const neon = "#00d4ff";

export async function BijuCommercialLanding() {
  const t = await getTranslations("BijuLanding");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050505] px-5 py-8 text-white sm:px-8 md:px-12 md:py-12">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-40 top-0 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
        style={{ background: `radial-gradient(circle, ${neon}33 0%, transparent 70%)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 h-[380px] w-[380px] rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${neon}28 0%, transparent 70%)` }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-[#00d4ff]/20 pb-8 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#00d4ff]">BIJU Tech</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Lumen OS v1.0</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">{t("navTagline")}</p>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#00d4ff]/55">Campo · máquinas pesadas · telemetria</p>
          </div>
          <nav className="flex shrink-0 flex-wrap items-center justify-end gap-2" aria-label="Navegação BIJU">
            <Link
              href="/about"
              className="rounded-lg border border-[#00d4ff]/25 bg-[#00d4ff]/5 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#00d4ff]/90 backdrop-blur-sm transition hover:border-[#00d4ff]/45 hover:bg-[#00d4ff]/10"
            >
              {t("navAbout")}
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-[#00d4ff]/35 bg-[#00d4ff]/10 px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition hover:border-[#00d4ff]/55 hover:bg-[#00d4ff]/15"
            >
              {t("navPricing")}
            </Link>
            <Link
              href={{ pathname: "/", query: { chemvault: "1" } }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gray-400 transition hover:border-[#00d4ff]/30 hover:text-[#00d4ff]"
            >
              {t("navChemVault")}
            </Link>
          </nav>
        </header>

        <section className="relative mx-auto mt-14 max-w-5xl text-center md:mt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[#00d4ff]/60">Hero</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance font-black uppercase italic leading-[1.02] tracking-tighter text-white drop-shadow-[0_0_40px_rgba(0,212,255,0.18)] sm:text-4xl md:text-6xl md:leading-[1.05]">
            LUMEN OS — Intelligence in Motion
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance font-mono text-sm text-[#00d4ff]/85 md:text-base">
            O Sistema Operacional Proprietário para Automação de Máquinas Pesadas
          </p>
        </section>

        <div className="relative mx-auto mt-16 max-w-6xl md:mt-20">
          <BijuTechTelemetryPanel />
        </div>

        <section className="relative mx-auto mt-20 max-w-6xl md:mt-24" aria-labelledby="biju-projects-heading">
          <h2 id="biju-projects-heading" className="text-center text-lg font-semibold tracking-tight text-white md:text-xl">
            Sessão de Projetos
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            Infraestrutura de campo e desenvolvimento contínuo — seleção técnica Lumen.
          </p>

          <article className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#00d4ff]/45 bg-[linear-gradient(155deg,rgba(0,212,255,0.08)_0%,rgba(8,8,8,0.95)_45%,#050505_100%)] p-8 shadow-[0_0_48px_-12px_rgba(0,212,255,0.2),inset_0_1px_0_rgba(0,212,255,0.15)] backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#00d4ff]/70">Destaque de engenharia</p>
            <h3 className="mt-3 font-mono text-xl font-bold tracking-tight text-white md:text-2xl">Projeto Eco-Bocal v2</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Calibração de bocal químico de baixo consumo, telemetria integrada ao Lumen OS e protocolos de segurança para operação remota.
            </p>
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#00d4ff]/50 bg-[#00d4ff]/10 py-3.5 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.15)] transition hover:border-[#00d4ff]/70 hover:bg-[#00d4ff]/18 sm:w-auto sm:px-10"
              >
                Acessar Esquema Técnico
              </Link>
            </div>
          </article>
        </section>

        <footer className="relative mx-auto mt-20 max-w-6xl border-t border-[#00d4ff]/15 pb-8 pt-12 md:mt-24">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.28em] text-[#00d4ff]/75">
            BIJU Tech — Uma divisão do Grupo Leno César &amp; Lumen Onel
          </p>
          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-white/[0.06] pt-8 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">{t("footerCopyright")}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-neutral-600">{t("footerNote")}</p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm md:justify-end" aria-label={t("footerLegalNavAria")}>
              <Link
                href="/about"
                className="text-neutral-500 transition hover:text-[#00d4ff] hover:underline hover:underline-offset-4"
              >
                {t("footerAbout")}
              </Link>
              <Link
                href="/licensing-terms"
                className="text-neutral-500 transition hover:text-[#00d4ff] hover:underline hover:underline-offset-4"
              >
                {t("footerTerms")}
              </Link>
              <Link
                href="/privacy"
                className="text-neutral-500 transition hover:text-[#00d4ff] hover:underline hover:underline-offset-4"
              >
                {t("footerPrivacy")}
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
