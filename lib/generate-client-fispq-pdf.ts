import { jsPDF } from "jspdf";

export type ClientFispqPdfLabels = {
  docSignature: string;
  pdfDocTitle: string;
  pdfCommercialTitle: string;
  pdfCommercialBody: string;
  pdfUsageTitle: string;
  pdfSafetyTitle: string;
  pdfFooterMonitored: string;
  pdfIssuedPrefix: string;
};

export type ClientFispqPdfContent = {
  formulaName: string;
  code: string;
  mixingInstructions: string;
  safetyPrecautions: string;
  issuedAtFormatted: string;
  labels: ClientFispqPdfLabels;
};

const MM = {
  margin: 18,
  bottomReserve: 26,
  headerH: 30,
  gold: [196, 165, 92] as const,
  goldDeep: [142, 112, 48] as const,
  ink: [22, 22, 26] as const,
  muted: [88, 88, 96] as const,
  paper: [252, 251, 248] as const,
};

function drawClientHeader(doc: jsPDF, pageW: number, docTitle: string) {
  doc.setFillColor(10, 10, 12);
  doc.rect(0, 0, pageW, MM.headerH, "F");
  doc.setDrawColor(...MM.gold);
  doc.setLineWidth(0.35);
  doc.line(0, MM.headerH, pageW, MM.headerH);

  doc.setTextColor(235, 220, 175);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Leno.Software", MM.margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 155, 145);
  doc.text(docTitle, MM.margin, 20);
}

function drawFooters(
  doc: jsPDF,
  pageW: number,
  pageH: number,
  monitoredLine: string,
  issuedLine: string,
) {
  const lineStep = 3.8;
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MM.muted);
    const mono = doc.splitTextToSize(monitoredLine, pageW - 2 * MM.margin);
    const blockH = mono.length * lineStep;
    let y = pageH - 11 - blockH;
    for (const line of mono) {
      doc.text(line, pageW / 2, y, { align: "center" });
      y += lineStep;
    }
    doc.setTextColor(...MM.goldDeep);
    doc.setFontSize(7.5);
    doc.text(issuedLine, pageW / 2, pageH - 7, { align: "center" });
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.15);
    doc.line(MM.margin, pageH - 13 - blockH, pageW - MM.margin, pageH - 13 - blockH);
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

export function downloadClientFispqPdf(content: ClientFispqPdfContent) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentWidth = pageW - 2 * MM.margin;

  doc.setFillColor(...MM.paper);
  doc.rect(0, 0, pageW, pageH, "F");

  drawClientHeader(doc, pageW, content.labels.pdfDocTitle);

  const yRef = { y: MM.headerH + 10 };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MM.muted);
  const sigLines = doc.splitTextToSize(content.labels.docSignature, contentWidth);
  for (const line of sigLines) {
    doc.text(line, MM.margin, yRef.y);
    yRef.y += 4.2;
  }
  yRef.y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...MM.ink);
  doc.text(content.formulaName, MM.margin, yRef.y);
  yRef.y += 9;

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
    content.labels.pdfCommercialTitle,
    content.labels.pdfCommercialBody,
    contentWidth,
  );
  writeWrappedSection(
    doc,
    yRef,
    pageW,
    pageH,
    content.labels.pdfUsageTitle,
    content.mixingInstructions,
    contentWidth,
  );
  writeWrappedSection(
    doc,
    yRef,
    pageW,
    pageH,
    content.labels.pdfSafetyTitle,
    content.safetyPrecautions,
    contentWidth,
  );

  const issuedLine = `${content.labels.pdfIssuedPrefix} ${content.issuedAtFormatted}`;
  drawFooters(doc, pageW, pageH, content.labels.pdfFooterMonitored, issuedLine);

  const safe = content.code.replace(/[^\w.-]+/g, "_");
  doc.save(`FISPQ-${safe}-cliente.pdf`);
}
