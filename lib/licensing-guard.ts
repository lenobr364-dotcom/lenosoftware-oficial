import "server-only";

import { cookies } from "next/headers";

import { INTERNATIONAL_TERMS_VERSION } from "@/lib/international-licensing-terms";
import { INTL_LICENSE_ACCEPT_COOKIE, verifyIntlLicenseAcceptCookie } from "@/lib/intl-license-accept-cookie";
import { prisma } from "@/lib/prisma";

export { INTERNATIONAL_TERMS_VERSION };

/** Fórmulas de alto valor cujo detalhe exige aceite registado (Solupan, ARLA 32). */
export function isRestrictedInternationalFormulaTitle(title: string): boolean {
  const n = title.toLowerCase();
  return n.includes("solupan") || n.includes("arla 32") || n.includes("arla32");
}

export async function hasValidInternationalTermsAcceptance(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(INTL_LICENSE_ACCEPT_COOKIE)?.value;
  const acceptanceId = verifyIntlLicenseAcceptCookie(raw);
  if (!acceptanceId) return false;
  try {
    const row = await prisma.internationalLicenseAcceptance.findUnique({
      where: { id: acceptanceId },
      select: { termsVersion: true },
    });
    return row !== null && row.termsVersion === INTERNATIONAL_TERMS_VERSION;
  } catch {
    return false;
  }
}

export type VaultFormulaRow = {
  id: string;
  title: string;
  productLine: string;
  rawMaterials: string;
  preparationMethod: string;
};

export function applyInternationalLicensingMask<T extends VaultFormulaRow>(
  rows: T[],
  hasAcceptance: boolean,
): (T & { locked?: boolean })[] {
  if (hasAcceptance) return rows.map((r) => ({ ...r }));
  return rows.map((r) => {
    if (!isRestrictedInternationalFormulaTitle(r.title)) return { ...r };
    return {
      ...r,
      rawMaterials: "",
      preparationMethod: "",
      locked: true as const,
    };
  });
}
