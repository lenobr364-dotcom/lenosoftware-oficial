import { ActivityLogWriter } from "@/app/components/ActivityLogWriter";
import { ClientAccessQrPanel } from "@/app/components/ClientAccessQrPanel";
import { FormulaPdfButton } from "@/app/components/FormulaPdfButton";
import { Link } from "@/i18n/navigation";
import { getFormulaCatalogRow, getFormulaTechnicalDetail } from "@/lib/formulas-catalog";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function FormulaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const row = getFormulaCatalogRow(id);
  if (!row) notFound();

  const detail = getFormulaTechnicalDetail(row);
  const t = await getTranslations("FormulaDetail");

  const pdfLabels = {
    tagline: t("pdfTagline"),
    compositionTitle: t("compositionTitle"),
    mixingTitle: t("mixingTitle"),
    footer: t("pdfDocumentFooter"),
    issuedPrefix: t("pdfIssuedPrefix"),
  };

  return (
    <main className="formula-print-root relative min-h-screen overflow-hidden bg-black px-4 py-10 text-white sm:px-8 md:px-12">
      <ActivityLogWriter formulaId={row.id} formulaName={row.name} />
      <div className="pointer-events-none absolute inset-0 print:hidden">
        <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0),rgba(0,0,0,0.75))]" />
      </div>

      <div className="relative mx-auto max-w-4xl print:max-w-none">
        <div className="mb-8 flex flex-col gap-5 print:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-300 backdrop-blur-md transition hover:border-yellow-400/30 hover:text-yellow-200 print:hidden"
          >
            <span aria-hidden>←</span> {t("back")}
          </Link>
          <div className="flex w-full flex-col gap-3 sm:ml-auto sm:w-auto sm:items-end">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <ClientAccessQrPanel formulaId={row.id} formulaName={row.name} locale={locale} />
              <FormulaPdfButton
                className="print:hidden"
                formulaName={row.name}
                code={row.code}
                composition={detail.composition}
                mixingInstructions={detail.mixingInstructions}
                locale={locale}
                labels={pdfLabels}
              />
            </div>
          </div>
        </div>

        <header className="rounded-[2rem] border border-white/15 bg-white/[0.07] p-8 shadow-[0_8px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl ring-1 ring-yellow-500/[0.12] print:border print:bg-white print:text-black print:shadow-none print:ring-0">
          <p className="text-[0.65rem] uppercase tracking-[0.42em] text-yellow-300/85 print:text-amber-800">{t("badge")}</p>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight text-white print:text-black md:text-4xl"
            style={{ textShadow: "0 0 20px rgba(255,215,0,0.15)" }}
          >
            {row.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 font-mono text-yellow-100/90 print:border-gray-400 print:bg-gray-100 print:text-black">
              {row.code}
            </span>
            <span className="rounded-xl border border-white/10 px-3 py-1.5 text-gray-400 print:border-gray-400 print:text-gray-700">
              ID · {row.id}
            </span>
          </div>
        </header>

        <div className="mt-8 space-y-6 print:mt-6 print:space-y-5">
          <GlassSection title={t("compositionTitle")} body={detail.composition} />
          <GlassSection title={t("mixingTitle")} body={detail.mixingInstructions} />
          <GlassSection title={t("safetyTitle")} body={detail.safetyPrecautions} accent="rose" />
        </div>

        <p className="mt-10 text-center text-[0.65rem] uppercase tracking-[0.35em] text-gray-600 print:text-gray-500">
          ChemVault Global · {t("footerNote")}
        </p>
      </div>
    </main>
  );
}

function GlassSection({
  title,
  body,
  accent = "amber",
}: {
  title: string;
  body: string;
  accent?: "amber" | "rose";
}) {
  const ring =
    accent === "rose"
      ? "ring-rose-400/[0.08] border-rose-400/10"
      : "ring-yellow-500/[0.08] border-white/12";

  return (
    <section
      className={`rounded-[1.75rem] border bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${ring} print:border-gray-300 print:bg-gray-50 print:shadow-none print:backdrop-blur-none`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-200/90 print:text-amber-900">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-gray-300 print:text-gray-800 md:text-base">{body}</p>
    </section>
  );
}
