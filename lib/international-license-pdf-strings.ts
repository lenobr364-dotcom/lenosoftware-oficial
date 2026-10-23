import type { InternationalLicensePdfInput } from "@/lib/international-license-transaction-pdf";

const PT: InternationalLicensePdfInput["strings"] = {
  docTitle: "Certificado de transação de licenciamento internacional",
  docSubtitle: "ChemVault Global · registo electrónico",
  ipLine:
    "Leno César é identificado como titular da propriedade intelectual e do know-how das formulações licenciadas através desta plataforma, em articulação com Lumen Onel.",
  body1:
    "Este documento comprova o registo de aceitação dos termos-cadre de licenciamento internacional na versão indicada, vinculando o signatário às obrigações de confidencialidade e conformidade descritas no contrato digital.",
  body2:
    "O código único abaixo deve ser citado em correspondência com parceiros, autoridades ou suporte ChemVault. Não substitui instrumentos licenciais executados por território.",
  footer: "© ChemVault Global · Leno César & Lumen Onel · Documento gerado electronicamente.",
};

const EN: InternationalLicensePdfInput["strings"] = {
  docTitle: "International licensing transaction certificate",
  docSubtitle: "ChemVault Global · electronic registry",
  ipLine:
    "Leno César is identified as the holder of intellectual property and technical know-how for formulations licensed through this platform, together with Lumen Onel.",
  body1:
    "This document evidences registration of acceptance of the international licensing framework in the stated version, binding the signatory to confidentiality and compliance duties described in the digital contract.",
  body2:
    "The unique code below should be cited in correspondence with partners, authorities, or ChemVault support. It does not replace executed territory-specific license instruments.",
  footer: "© ChemVault Global · Leno César & Lumen Onel · Generated electronically.",
};

const ES: InternationalLicensePdfInput["strings"] = {
  docTitle: "Certificado de transacción de licencia internacional",
  docSubtitle: "ChemVault Global · registro electrónico",
  ipLine:
    "Leno César figura como titular de la propiedad intelectual y del know-how de las formulaciones licenciadas a través de esta plataforma, junto con Lumen Onel.",
  body1:
    "Este documento acredita el registro de aceptación del marco de licencia internacional en la versión indicada, vinculando al firmante a las obligaciones de confidencialidad y cumplimiento del contrato digital.",
  body2:
    "El código único debe citarse en correspondencia con socios, autoridades o soporte ChemVault. No sustituye instrumentos licenciales ejecutados por territorio.",
  footer: "© ChemVault Global · Leno César & Lumen Onel · Generado electrónicamente.",
};

export function internationalLicensePdfStringsForLocale(locale: string): InternationalLicensePdfInput["strings"] {
  if (locale === "pt") return PT;
  if (locale === "es") return ES;
  return EN;
}
