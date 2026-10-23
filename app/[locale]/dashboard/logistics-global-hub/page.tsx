import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { LogisticsGlobalHubClient } from "@/app/components/logistics/LogisticsGlobalHubClient";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LogisticsGlobalHubPage() {
  const t = await getTranslations("LogisticsGlobalHub");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="dashboard" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header
          className={[
            "rounded-[2.5rem] border border-white/10 p-7 shadow-[0_0_55px_rgba(255,215,0,0.1)] backdrop-blur-2xl md:p-9",
            "bg-gradient-to-br from-white/[0.07] via-cyan-950/[0.08] to-black/55",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-300 transition hover:border-amber-400/30 hover:text-amber-100"
            >
              {t("back")}
            </Link>
          </div>
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/75">{t("eyebrow")}</p>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ textShadow: "0 0 18px rgba(34,211,238,0.18)" }}
          >
            {t("title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-400 md:text-base">{t("subtitle")}</p>
          <p className="mt-3 max-w-3xl text-xs leading-relaxed text-neutral-600">{t("originNote")}</p>
        </header>

        <LogisticsGlobalHubClient />
      </div>
    </main>
  );
}
