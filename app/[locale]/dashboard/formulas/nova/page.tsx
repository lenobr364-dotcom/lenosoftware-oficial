import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NovaFormulaPage() {
  const t = await getTranslations("Dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-16 text-white md:px-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.18),transparent_65%)] blur-2xl" />
      </div>
      <section className="relative mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-[0_0_48px_rgba(255,215,0,0.12)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/80">ChemVault</p>
        <h1 className="mt-4 text-2xl font-semibold text-white md:text-3xl">{t("novaTitle")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-400">{t("novaSubtitle")}</p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black shadow-lg shadow-amber-500/20 transition hover:brightness-110"
        >
          {t("novaBack")}
        </Link>
      </section>
    </main>
  );
}
