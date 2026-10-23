import { ProfileSettingsClient } from "@/app/components/dashboard/ProfileSettingsClient";
import { getTranslations } from "next-intl/server";

export default async function DashboardProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });

  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white md:p-12">
      <header className="mx-auto mb-10 max-w-2xl">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">{t("profileEyebrow")}</p>
        <h1 className="mt-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-black uppercase italic tracking-tighter text-transparent md:text-4xl">
          {t("profileTitle")}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{t("profileSubtitle")}</p>
      </header>
      <ProfileSettingsClient />
    </div>
  );
}
