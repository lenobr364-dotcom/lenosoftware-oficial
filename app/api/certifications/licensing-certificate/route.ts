import { NextRequest, NextResponse } from "next/server";

import { getLicensingCertificatePdfStrings, productLineLabelForLocale } from "@/lib/certifications-pdf-strings";
import { parseProductLine } from "@/lib/product-line";
import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";
import { buildLicensingCertificatePdf } from "@/lib/licensing-certificate-pdf";
import { prisma } from "@/lib/prisma";
import { isApprovedLeadStatus } from "@/lib/technical-library-access";

export const dynamic = "force-dynamic";

function dateDisplay(locale: string, d: Date): string {
  const tag =
    locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-US";
  return new Intl.DateTimeFormat(tag, { dateStyle: "long" }).format(d);
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CEO_SESSION_COOKIE)?.value;
  if (!(await verifyCeoSessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId")?.trim();
  const formulaId = searchParams.get("formulaId")?.trim();
  const locale = (searchParams.get("locale") ?? "en").trim();
  if (!leadId || !formulaId) {
    return NextResponse.json({ error: "Missing leadId or formulaId" }, { status: 400 });
  }

  const allowed = new Set(["en", "pt", "de", "hi"]);
  const loc = allowed.has(locale) ? locale : "en";

  let lead;
  let formula;
  try {
    [lead, formula] = await Promise.all([
      prisma.licenseRequest.findUnique({ where: { id: leadId } }),
      prisma.formula.findUnique({
        where: { id: formulaId },
        select: { id: true, nome: true, categoria: true },
      }),
    ]);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (!isApprovedLeadStatus(lead.status)) {
    return NextResponse.json({ error: "Lead is not approved" }, { status: 403 });
  }
  if (!formula) {
    return NextResponse.json({ error: "Formula not found" }, { status: 404 });
  }

  const strings = getLicensingCertificatePdfStrings(loc);
  const productLineLabel = productLineLabelForLocale(loc, parseProductLine(formula.categoria, formula.nome));
  const refCode = `${lead.id.slice(0, 8).toUpperCase()}-${formula.id.slice(0, 8).toUpperCase()}`;
  const issued = new Date();

  const pdf = buildLicensingCertificatePdf({
    refCode,
    issuedDateDisplay: dateDisplay(loc, issued),
    company: lead.company,
    country: lead.country,
    corporateEmail: lead.corporateEmail,
    formulaTitle: formula.nome,
    productLineLabel,
    strings,
  });

  const filename = `BIJU-Licensing-Certificate-${refCode}.pdf`.replace(/\s+/g, "-");
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  headers.set("Cache-Control", "private, no-store");

  return new NextResponse(new Uint8Array(pdf), { status: 200, headers });
}
