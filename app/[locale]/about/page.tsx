import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutVision" });
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}/about`]),
  );
  languages["x-default"] = `${baseUrl}/en/about`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `${baseUrl}/${locale}/about`, languages },
  };
}

export default async function AboutVisionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AboutVision");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020308] px-5 py-12 text-white sm:px-8 md:px-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-15%,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/85">{t("eyebrow")}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h1>
        <p className="mt-5 text-sm leading-relaxed text-neutral-300 md:text-base">{t("lead")}</p>

        <div
          className={[
            "mt-10 space-y-6 rounded-[2rem] border border-white/[0.1] p-8 md:p-10",
            "bg-[linear-gradient(165deg,rgba(255,255,255,0.08)_0%,rgba(34,211,238,0.05)_38%,rgba(2,3,8,0.55)_100%)]",
            "backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_64px_-24px_rgba(0,0,0,0.65)]",
          ].join(" ")}
        >
          <p className="text-sm leading-relaxed text-neutral-300 md:text-[0.95rem]">{t("body1")}</p>
          <p className="text-sm leading-relaxed text-neutral-300 md:text-[0.95rem]">{t("body2")}</p>
          <p className="text-sm leading-relaxed text-neutral-300 md:text-[0.95rem]">{t("body3")}</p>
          <p className="border-t border-white/[0.08] pt-6 text-xs font-medium uppercase tracking-[0.18em] text-amber-200/85">
            {t("signatureLine")}
          </p>
        </div>

        <Link
          href="/"
          className="mt-12 inline-flex items-center rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-200 transition hover:border-cyan-400/30 hover:text-white"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
