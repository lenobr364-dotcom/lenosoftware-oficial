import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

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
    <div className="flex min-h-screen flex-col justify-between bg-neutral-950 p-8 text-neutral-100 selection:bg-emerald-500 selection:text-black">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-emerald-400">CHEMVAULT GLOBAL</h1>
          <p className="mt-1 text-xs text-neutral-400">{t("headerTagline")}</p>
        </div>
        <div className="flex items-center gap-3 rounded border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          <span className="font-mono font-bold text-neutral-300">{t("headerOnlineBadge")}</span>
        </div>
      </header>

      <main className="my-auto mx-auto flex max-w-3xl flex-col items-center py-12 text-center">
        <div className="mb-4 font-mono text-xs tracking-widest text-emerald-400">{t("heroEyebrow")}</div>

        <h2 className="mb-6 font-mono text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
          {t("heroTitlePrefix")}{" "}
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            {t("heroTitleHighlight")}
          </span>
        </h2>

        <p className="mb-8 text-sm leading-relaxed text-neutral-400 md:text-base">{t("heroDescription")}</p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded bg-emerald-500 px-6 py-3 font-mono text-xs font-bold text-black transition-colors hover:bg-emerald-600"
          >
            {t("ctaEnter")}
          </Link>
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-6 font-mono text-xs text-neutral-500">
        <div>{t("footerCopyright", { year: new Date().getFullYear() })}</div>
        <div>{t("footerStatus")}</div>
      </footer>
    </div>
  );
}
