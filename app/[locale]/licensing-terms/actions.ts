"use server";

import { randomBytes } from "node:crypto";

import { defaultCurrencyForLegalLang, toPrismaCurrencyCode } from "@/lib/currency-code";
import { INTERNATIONAL_TERMS_VERSION, type IntlLegalLang } from "@/lib/international-licensing-terms";
import { INTL_LICENSE_ACCEPT_COOKIE, signIntlLicenseAcceptCookie } from "@/lib/intl-license-accept-cookie";
import { notifyAdminInternationalLicenseActivated } from "@/lib/admin-event-notify";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import type { AcceptIntlTermsState } from "./accept-state";

export async function recordInternationalLicensingAcceptance(
  _prev: AcceptIntlTermsState,
  formData: FormData,
): Promise<AcceptIntlTermsState> {
  const agreed = formData.get("agreed") === "on" || formData.get("agreed") === "true";
  const rawLang = String(formData.get("legalLang") ?? "en");
  const legalLang = (["pt", "en", "es"] as const).includes(rawLang as IntlLegalLang)
    ? (rawLang as IntlLegalLang)
    : "en";

  if (!agreed) {
    return { ok: false, error: "must_agree" };
  }

  const signerEmailRaw = String(formData.get("signerEmail") ?? "").trim();
  const signerEmail = signerEmailRaw.length > 0 ? signerEmailRaw : null;

  const transactionCode = `INTL-LIC-${randomBytes(6).toString("hex").toUpperCase()}`;
  const currencyCode = toPrismaCurrencyCode(defaultCurrencyForLegalLang(legalLang));

  let row: { id: string };
  try {
    row = await prisma.internationalLicenseAcceptance.create({
      data: {
        transactionCode,
        termsVersion: INTERNATIONAL_TERMS_VERSION,
        locale: legalLang,
        signerEmail,
        currencyCode,
      },
    });
  } catch {
    return { ok: false, error: "server" };
  }

  notifyAdminInternationalLicenseActivated({
    transactionCode,
    locale: legalLang,
    signerEmail,
    currencyCode: String(currencyCode),
  });

  const jar = await cookies();
  const token = signIntlLicenseAcceptCookie(row.id);
  jar.set(INTL_LICENSE_ACCEPT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 180 * 24 * 60 * 60,
  });

  return { ok: true, transactionCode };
}
