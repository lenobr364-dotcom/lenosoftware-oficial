import { jsPDF } from "jspdf";

export type FormulaPdfLabels = {
  tagline: string;
  compositionTitle: string;
  mixingTitle: string;
  footer: string;
  issuedPrefix: string;
};

export type FormulaPdfContent = {
  formulaName: string;
  code: string;
  composition: string;
  mixingInstructions: string;
  issuedAtFormatted: string;
  labels: FormulaPdfLabels;
};

const MM = {
  margin: 18,
  bottomReserve: 22,
  headerH: 36,
  gold: [196, 165, 92] as const,
  goldDeep: [142, 112, 48] as const,
  ink: [22, 22, 26] as const,
  muted: [88, 88, 96] as const,
  paper: [252, 251, 248] as const,
};

function drawHeader(doc: jsPDF, pageW: number) {
  doc.setFillColor(10, 10, 12);
  doc.rect(0, 0, pageW, MM.headerH, "F");
  doc.setDrawColor(...MM.gold);
  doc.setLineWidth(0.35);
  doc.line(0, MM.headerH, pageW, MM.headerH);

  doc.setTextColor(235, 220, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Leno.Software", MM.margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 155, 145);
  doc.text("Enterprise · Secure formulations", MM.margin, 21);
}

function drawFooters(doc: jsPDF, pageW: number, pageH: number, footer: string, issuedLine: string) {
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MM.muted);
    doc.text(footer, pageW / 2, pageH - 14, { align: "center" });
    doc.setTextColor(...MM.goldDeep);
    doc.text(issuedLine, pageW / 2, pageH - 9, { align: "center" });
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.15);
    doc.line(MM.margin, pageH - 18, pageW - MM.margin, pageH - 18);
  }
}

function writeWrappedSection(
  doc: jsPDF,
  yRef: { y: number },
  pageW: number,
  pageH: number,
  title: string,
  body: string,
  contentWidth: number,
) {
  const lineH = 4.9;
  const titleBlock = 9;

  const ensure = (h: number) => {
    if (yRef.y + h > pageH - MM.bottomReserve) {
      doc.addPage();
      doc.setFillColor(...MM.paper);
      doc.rect(0, 0, pageW, pageH, "F");
      yRef.y = MM.margin;
    }
  };

  ensure(titleBlock + lineH);
  doc.setFillColor(248, 244, 236);
  doc.roundedRect(MM.margin, yRef.y - 1, contentWidth, 8, 1, 1, "F");
  doc.setDrawColor(...MM.gold);
  doc.setLineWidth(0.25);
  doc.line(MM.margin, yRef.y + 7, MM.margin + 3.5, yRef.y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...MM.goldDeep);
  doc.text(title.toUpperCase(), MM.margin + 5, yRef.y + 5);
  yRef.y += titleBlock;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MM.ink);
  const lines = doc.splitTextToSize(body, contentWidth);
  for (const line of lines) {
    ensure(lineH);
    doc.text(line, MM.margin, yRef.y);
    yRef.y += lineH;
  }
  yRef.y += 8;
}

export function downloadFormulaPdf(content: FormulaPdfContent) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentWidth = pageW - 2 * MM.margin;

  doc.setFillColor(...MM.paper);
  doc.rect(0, 0, pageW, pageH, "F");

  drawHeader(doc, pageW);

  const yRef = { y: MM.headerH + 12 };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MM.muted);
  doc.text(content.labels.tagline, MM.margin, yRef.y);
  yRef.y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...MM.ink);
  doc.text(content.formulaName, MM.margin, yRef.y);
  yRef.y += 10;

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(70, 68, 78);
  doc.text(content.code, MM.margin, yRef.y);
  yRef.y += 6;

  doc.setDrawColor(...MM.gold);
  doc.setLineWidth(0.2);
  doc.line(MM.margin, yRef.y, pageW - MM.margin, yRef.y);
  yRef.y += 10;

  writeWrappedSection(
    doc,
    yRef,
    pageW,
    pageH,
    content.labels.compositionTitle,
    content.composition,
    contentWidth,
  );
  writeWrappedSection(
    doc,
    yRef,
    pageW,
    pageH,
    content.labels.mixingTitle,
    content.mixingInstructions,
    contentWidth,
  );

  const issuedLine = `${content.labels.issuedPrefix} ${content.issuedAtFormatted}`;
  drawFooters(doc, pageW, pageH, content.labels.footer, issuedLine);

  const safe = content.code.replace(/[^\w.-]+/g, "_");
  doc.save(`ChemVault-${safe}.pdf`);
}
