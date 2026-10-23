import de from "@/messages/de.json";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import pt from "@/messages/pt.json";

import type { LicensingCertificatePdfStrings } from "@/lib/licensing-certificate-pdf";

type MessagesRoot = {
  CertificationsCenter?: {
    pdf?: LicensingCertificatePdfStrings & Record<string, string>;
  };
};

function block(locale: string): LicensingCertificatePdfStrings {
  const pick = (m: MessagesRoot): LicensingCertificatePdfStrings => {
    const pdf = m.CertificationsCenter?.pdf;
    if (!pdf) throw new Error("CertificationsCenter.pdf missing in messages");
    return {
      docTitle: pdf.docTitle,
      docSubtitle: pdf.docSubtitle,
      referenceLine: pdf.referenceLine,
      paragraph1: pdf.paragraph1,
      paragraph2: pdf.paragraph2,
      paragraph3: pdf.paragraph3,
      signatureLine: pdf.signatureLine,
      footerLine: pdf.footerLine,
    };
  };
  if (locale === "pt") return pick(pt as MessagesRoot);
  if (locale === "de") return pick(de as MessagesRoot);
  if (locale === "hi") return pick(hi as MessagesRoot);
  return pick(en as MessagesRoot);
}

export function getLicensingCertificatePdfStrings(locale: string): LicensingCertificatePdfStrings {
  try {
    return block(locale);
  } catch {
    return block("en");
  }
}

export function productLineLabelForLocale(
  locale: string,
  line: "AUTOMOTIVE" | "BAR_SOAP" | "GENERAL_CLEANING",
): string {
  const roots: Record<string, MessagesRoot> = {
    en: en as MessagesRoot,
    pt: pt as MessagesRoot,
    de: de as MessagesRoot,
    hi: hi as MessagesRoot,
  };
  const m = roots[locale] ?? (en as MessagesRoot);
  const pdf = m.CertificationsCenter?.pdf as Record<string, string> | undefined;
  const key =
    line === "AUTOMOTIVE" ? "productLineAutomotive" : line === "BAR_SOAP" ? "productLineBarSoap" : "productLineGeneralCleaning";
  return pdf?.[key] ?? line;
}
