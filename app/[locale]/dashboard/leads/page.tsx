import { LeadsManagementTable, type LeadRowSerializable } from "@/app/components/LeadsManagementTable";
import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function DashboardLeadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Dashboard");

  let rows: LeadRowSerializable[] = [];
  try {
    const raw = await prisma.licenseRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    rows = raw.map((r) => ({
      id: r.id,
      company: r.company,
      country: r.country,
      corporateEmail: r.corporateEmail,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    rows = [];
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="dashboard" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header
          className={[
            "rounded-[2.5rem] border border-white/10 p-8 shadow-[0_0_55px_rgba(255,215,0,0.12)] backdrop-blur-2xl md:p-10",
            "bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-black/50",
          ].join(" ")}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 transition-all duration-300 ease-out hover:border-yellow-500/35 hover:bg-yellow-500/10 hover:text-yellow-100"
                >
                  ← {t("leadsBackDashboard")}
                </Link>
                <Link
                  href="/"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-400 transition-all duration-300 ease-out hover:border-emerald-500/30 hover:text-emerald-100/90"
                >
                  {t("navVaultHome")}
                </Link>
              </div>
              <p className="text-xs uppercase tracking-[0.36em] text-yellow-300/75">{t("leadsPageEyebrow")}</p>
              <h1
                className="text-3xl font-semibold tracking-tight md:text-4xl"
                style={{ textShadow: "0 0 14px rgba(255,215,0,0.18)" }}
              >
                {t("leadsPageTitle")}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-400 md:text-base">{t("leadsPageSubtitle")}</p>
            </div>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_55px_rgba(255,215,0,0.08)] backdrop-blur-2xl md:p-10">
          <LeadsManagementTable rows={rows} locale={locale} />
        </section>
      </div>
    </main>
  );
}
