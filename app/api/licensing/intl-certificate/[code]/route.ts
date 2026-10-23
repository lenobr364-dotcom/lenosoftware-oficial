import { buildInternationalLicenseTransactionPdf } from "@/lib/international-license-transaction-pdf";
import { internationalLicensePdfStringsForLocale } from "@/lib/international-license-pdf-strings";
import { verifyIntlLicenseAcceptCookie, INTL_LICENSE_ACCEPT_COOKIE } from "@/lib/intl-license-accept-cookie";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function dateDisplay(locale: string, d: Date): string {
  const tag =
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-US";
  return new Intl.DateTimeFormat(tag, { dateStyle: "long" }).format(d);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const trimmed = code?.trim();
  if (!trimmed || !trimmed.startsWith("INTL-LIC-")) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  let row: {
    id: string;
    transactionCode: string;
    locale: string;
    signerEmail: string | null;
    createdAt: Date;
  } | null = null;
  try {
    row = await prisma.internationalLicenseAcceptance.findUnique({
      where: { transactionCode: trimmed },
      select: { id: true, transactionCode: true, locale: true, signerEmail: true, createdAt: true },
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jar = await cookies();
  const cookieAcceptanceId = verifyIntlLicenseAcceptCookie(jar.get(INTL_LICENSE_ACCEPT_COOKIE)?.value);
  const ceo = await isCeoAuthenticated();
  const allowed = ceo || cookieAcceptanceId === row.id;

  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const strings = internationalLicensePdfStringsForLocale(row.locale);
  const pdf = buildInternationalLicenseTransactionPdf({
    transactionCode: row.transactionCode,
    issuedDateDisplay: dateDisplay(row.locale, row.createdAt),
    locale: row.locale,
    signerEmail: row.signerEmail,
    strings,
  });

  const filename = `ChemVault-INTL-LICENSE-${row.transactionCode.replace(/[^A-Z0-9-]/gi, "")}.pdf`;
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Cache-Control", "private, no-store");

  return new NextResponse(new Uint8Array(pdf), { status: 200, headers });
}
