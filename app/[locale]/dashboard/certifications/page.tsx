import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { LicensingCertificateGenerator } from "@/app/components/certifications/LicensingCertificateGenerator";
import { Link } from "@/i18n/navigation";
import { parseProductLine } from "@/lib/product-line";
import { prisma } from "@/lib/prisma";
import { APPROVED_LEAD_STATUSES } from "@/lib/technical-library-access";
import { Factory, Leaf, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

const badgeShell = [
  "relative overflow-hidden rounded-[1.75rem] border border-cyan-500/15",
  "bg-gradient-to-br from-white/[0.06] via-cyan-950/[0.1] to-black/65",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_36px_-8px_rgba(34,211,238,0.14)] backdrop-blur-2xl md:p-7",
].join(" ");

const badgeTop =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent";

export default async function CertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("CertificationsCenter");

  let approvedLeads: {
    id: string;
    company: string;
    country: string;
    corporateEmail: string;
    status: string;
  }[] = [];
  let formulas: { id: string; title: string; productLine: "AUTOMOTIVE" | "BAR_SOAP" | "GENERAL_CLEANING" }[] = [];

  try {
    const [leads, frows] = await Promise.all([
      prisma.licenseRequest.findMany({
        where: { status: { in: [...APPROVED_LEAD_STATUSES] } },
        orderBy: { createdAt: "desc" },
        select: { id: true, company: true, country: true, corporateEmail: true, status: true },
      }),
      prisma.formula.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, categoria: true },
      }),
    ]);
    approvedLeads = leads;
    formulas = frows.map((r) => ({
      id: r.id,
      title: r.nome,
      productLine: parseProductLine(r.categoria, r.nome),
    }));
  } catch {
    approvedLeads = [];
    formulas = [];
  }

  const badges = [
    { key: "iso", icon: ShieldCheck, title: t("badgeIsoTitle"), body: t("badgeIsoBody") },
    { key: "eco", icon: Leaf, title: t("badgeEcoTitle"), body: t("badgeEcoBody") },
    { key: "ind", icon: Factory, title: t("badgeIndustrialTitle"), body: t("badgeIndustrialBody") },
  ] as const;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="dashboard" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header
          className={[
            "rounded-[2.5rem] border border-white/10 p-7 shadow-[0_0_55px_rgba(255,215,0,0.1)] backdrop-blur-2xl md:p-9",
            "bg-gradient-to-br from-white/[0.07] via-amber-950/[0.06] to-black/60",
          ].join(" ")}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-300 transition hover:border-amber-400/30 hover:text-amber-100"
          >
            {t("back")}
          </Link>
          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-300/75">{t("eyebrow")}</p>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ textShadow: "0 0 18px rgba(251,191,36,0.15)" }}
          >
            {t("title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-400 md:text-base">{t("subtitle")}</p>
        </header>

        <section aria-labelledby="badges-heading">
          <h2 id="badges-heading" className="text-xl font-semibold tracking-tight text-white md:text-2xl">
            {t("badgesTitle")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-500">{t("badgesSubtitle")}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <article key={b.key} className={badgeShell}>
                  <div className={badgeTop} aria-hidden />
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
                      <Icon className="h-6 w-6 stroke-[1.5]" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white/95">{b.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{b.body}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <LicensingCertificateGenerator locale={locale} approvedLeads={approvedLeads} formulas={formulas} />
      </div>
    </main>
  );
}
