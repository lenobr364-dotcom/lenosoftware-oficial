import { LicensingEngineLazy } from "@/components/licensing-engine/LicensingEngineLazy";
import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function LicensingEnginePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations("Dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050a] px-5 py-8 text-white md:px-10 md:py-12">
      <ChemVaultPageBackdrop tone="dashboard" />

      <div className="relative z-10 mx-auto max-w-[100rem]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-white"
          >
            ← {t("analyticsBack")}
          </Link>
        </div>

        <LicensingEngineLazy />
      </div>
    </main>
  );
}
