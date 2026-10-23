import { InternationalLicensingTermsClient } from "./InternationalLicensingTermsClient";
import { defaultLegalLangFromUiLocale } from "@/lib/international-licensing-terms";
import { hasValidInternationalTermsAcceptance } from "@/lib/licensing-guard";
import { getLocale } from "next-intl/server";

export default async function LicensingTermsPage() {
  const locale = await getLocale();
  const initialLegalLang = defaultLegalLangFromUiLocale(locale);
  const alreadyAccepted = await hasValidInternationalTermsAcceptance();

  return (
    <InternationalLicensingTermsClient initialLegalLang={initialLegalLang} alreadyAccepted={alreadyAccepted} />
  );
}
