import { jsPDF } from "jspdf";

export type InternationalLicensePdfInput = {
  transactionCode: string;
  issuedDateDisplay: string;
  locale: string;
  signerEmail: string | null;
  strings: {
    docTitle: string;
    docSubtitle: string;
    ipLine: string;
    body1: string;
    body2: string;
    footer: string;
  };
};

export function buildInternationalLicenseTransactionPdf(input: InternationalLicensePdfInput): Buffer {
  const { strings, transactionCode, issuedDateDisplay, locale, signerEmail } = input;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.8);
  doc.line(margin, 20, pageW - margin, 20);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("ChemVault Global", margin, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("International licensing · Leno César & Lumen Onel", margin, 26);

  let y = 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(strings.docTitle, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(strings.docSubtitle, margin, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 145, 178);
  doc.text(`${transactionCode}`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${issuedDateDisplay} · UI: ${locale}${signerEmail ? ` · ${signerEmail}` : ""}`, margin, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Intellectual property", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const ipLines = doc.splitTextToSize(strings.ipLine, pageW - 2 * margin);
  doc.text(ipLines, margin, y);
  y += ipLines.length * 4.8 + 6;

  doc.setFontSize(9.5);
  const b1 = doc.splitTextToSize(strings.body1, pageW - 2 * margin);
  doc.text(b1, margin, y);
  y += b1.length * 4.6 + 4;
  const b2 = doc.splitTextToSize(strings.body2, pageW - 2 * margin);
  doc.text(b2, margin, y);
  y += b2.length * 4.6 + 10;

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const foot = doc.splitTextToSize(strings.footer, pageW - 2 * margin);
  doc.text(foot, margin, pageH - 16);

  return Buffer.from(doc.output("arraybuffer"));
}
