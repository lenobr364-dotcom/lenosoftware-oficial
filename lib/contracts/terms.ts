import {
  defaultLegalLangFromUiLocale,
  getInternationalTermsBlock,
  INTERNATIONAL_TERMS_VERSION,
  type IntlLegalLang,
} from "@/lib/international-licensing-terms";
import type { ContractTermsPayload } from "@/lib/contracts/types";

/** Mapeia locale UI (next-intl) → idioma legal do contrato. */
export function legalLangFromUiLocale(uiLocale: string): IntlLegalLang {
  if (uiLocale === "de") return "en";
  if (uiLocale === "hi" || uiLocale === "ar") return "en";
  return defaultLegalLangFromUiLocale(uiLocale);
}

export function buildContractTermsPayload(
  contractId: string,
  uiLocale: string,
): ContractTermsPayload {
  const legalLang = legalLangFromUiLocale(uiLocale);
  const block = getInternationalTermsBlock(legalLang);

  return {
    contractId,
    version: INTERNATIONAL_TERMS_VERSION,
    legalLang,
    title: block.title,
    ipLine: block.ipLine,
    sections: block.sections,
    generatedAt: new Date().toISOString(),
  };
}
