import { jsPDF } from "jspdf";

export type LicensingCertificatePdfStrings = {
  docTitle: string;
  docSubtitle: string;
  referenceLine: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  signatureLine: string;
  footerLine: string;
};

export type LicensingCertificatePdfPayload = {
  refCode: string;
  issuedDateDisplay: string;
  company: string;
  country: string;
  corporateEmail: string;
  formulaTitle: string;
  productLineLabel: string;
  strings: LicensingCertificatePdfStrings;
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function buildLicensingCertificatePdf(payload: LicensingCertificatePdfPayload): Buffer {
  const { strings } = payload;
  const vars: Record<string, string> = {
    ref: payload.refCode,
    date: payload.issuedDateDisplay,
    company: payload.company,
    country: payload.country,
    email: payload.corporateEmail,
    formula: payload.formulaTitle,
    productLine: payload.productLineLabel,
  };

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;

  doc.setFillColor(250, 248, 244);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.line(margin, 22, pageW - margin, 22);

  doc.setTextColor(18, 18, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("BIJU Global Technology", margin, 16);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  doc.text("ChemVault · Commercial licensing infrastructure", margin, 30);

  let y = 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(12, 12, 12);
  doc.text(strings.docTitle, margin, y);
  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(90, 90, 90);
  doc.text(strings.docSubtitle, margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(45, 45, 45);
  const refText = fill(strings.referenceLine, vars);
  doc.text(refText, margin, y);
  y += 12;

  const body1 = fill(strings.paragraph1, vars);
  const body2 = fill(strings.paragraph2, vars);
  const body3 = fill(strings.paragraph3, vars);

  const w = pageW - margin * 2;
  const lh = 5.2;
  for (const block of [body1, body2, body3]) {
    const lines = doc.splitTextToSize(block, w);
    doc.text(lines, margin, y);
    y += lines.length * lh + 4;
    if (y > pageH - 50) {
      doc.addPage();
      y = margin;
    }
  }

  y = Math.max(y, pageH - 58);
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, pageW - margin, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(55, 55, 55);
  doc.text(strings.signatureLine, margin, y);
  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  const footLines = doc.splitTextToSize(strings.footerLine, w);
  doc.text(footLines, margin, y);

  const out = doc.output("arraybuffer");
  return Buffer.from(new Uint8Array(out));
}
