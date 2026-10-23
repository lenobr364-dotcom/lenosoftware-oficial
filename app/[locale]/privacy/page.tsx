import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("Legal");

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{t("privacyTitle")}</h1>
        <p className="mt-6 text-sm leading-relaxed text-neutral-400 md:text-base">{t("privacyBody")}</p>
        <Link href="/" className="mt-10 inline-block text-sm text-cyan-400/90 underline-offset-4 hover:text-cyan-300 hover:underline">
          {t("backToLanding")}
        </Link>
      </div>
    </main>
  );
}
