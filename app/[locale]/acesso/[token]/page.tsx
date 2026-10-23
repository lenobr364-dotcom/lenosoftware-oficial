import { ClientAccessExperience } from "@/app/components/ClientAccessExperience";
import { verifyClientAccessToken } from "@/lib/client-access-token";
import { FORMULAS } from "@/lib/formulas";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function ClientFormulaAccessPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token: rawToken } = await params;
  const token = decodeURIComponent(rawToken);
  const verified = await verifyClientAccessToken(token);
  if (!verified) notFound();

  const row = FORMULAS.find((f) => f.id === verified.formulaId);
  if (!row) notFound();

  const t = await getTranslations({ locale, namespace: "ClientView" });

  const copy = {
    docSignature: t("docSignature"),
    clientNotice: t("clientNotice"),
    eyebrow: t("eyebrow"),
    brand: t("brand"),
    mixingTitle: t("mixingTitle"),
    safetyTitle: t("safetyTitle"),
    footer: t("footer"),
    fispqButton: t("fispqButton"),
    fispqGenerating: t("fispqGenerating"),
    pdf: {
      docSignature: t("docSignature"),
      pdfDocTitle: t("pdfDocTitle"),
      pdfCommercialTitle: t("pdfCommercialTitle"),
      pdfCommercialBody: t("pdfCommercialBody"),
      pdfUsageTitle: t("pdfUsageTitle"),
      pdfSafetyTitle: t("pdfSafetyTitle"),
      pdfFooterMonitored: t("pdfFooterMonitored"),
      pdfIssuedPrefix: t("pdfIssuedPrefix"),
    },
  };

  return (
    <ClientAccessExperience
      locale={locale}
      formulaName={row.name}
      code={row.code}
      mixingInstructions={row.mixingInstructions}
      safetyPrecautions={row.safetyPrecautions}
      copy={copy}
    />
  );
}
