import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { ExecutiveCatalog } from "@/app/components/catalog/ExecutiveCatalog";
import { LenoSeal } from "@/app/components/executive/LenoSeal";
import { LocaleSwitch } from "@/app/components/executive/LocaleSwitch";
import { LandingHomeClient } from "@/app/components/LandingHomeClient";

type HomeProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ chemvault?: string | string[] }>;
};

function chemvaultOpen(value: string | string[] | undefined): boolean {
  if (value === "1") return true;
  if (Array.isArray(value)) return value.includes("1");
  return false;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomeLanding" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Home({ params, searchParams }: HomeProps) {
  await params;
  const sp = await searchParams;
  const showVault = chemvaultOpen(sp.chemvault);

  if (showVault) {
    /** Fórmulas só via cookie httpOnly após POST /api/vault/unlock — evita vazamento no HTML inicial. */
    return <LandingHomeClient formulas={[]} />;
  }

  const t = await getTranslations("HomeLanding");

  return (
    <div className="cv-executive min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#10B981]">ChemVault Global</p>
          <LenoSeal className="mt-2" />
        </div>
        <LocaleSwitch />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20">
        <section className="cv-glass rounded-[2rem] px-6 py-12 md:px-12 md:py-16">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#D4AF37]">{t("heroEyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#f4f1ea] md:text-6xl">
            {t("heroTitlePrefix")}{" "}
            <span className="text-[#10B981]">{t("heroTitleHighlight")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#f4f1ea]/72 md:text-base">{t("heroDescription")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#10B981] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#34d399]"
            >
              {t("ctaEnter")}
            </Link>
            <a
              href="#catalogo"
              className="rounded-full border border-[#D4AF37]/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF37] transition hover:border-[#D4AF37]"
            >
              {t("ctaCatalog")}
            </a>
          </div>
        </section>

        <div id="catalogo">
          <ExecutiveCatalog />
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[#D4AF37]/20 px-6 py-6 text-xs text-[#f4f1ea]/55">
        <LenoSeal />
        <p>{t("footerCopyright", { year: new Date().getFullYear() })}</p>
        <p>{t("footerStatus")}</p>
      </footer>
    </div>
  );
}
