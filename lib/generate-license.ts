import { jsPDF } from "jspdf";

/**
 * Gera e transfere um PDF de licenciamento (orientação paisagem).
 * Usar apenas no cliente (`save()` depende do ambiente de browser).
 */
export function generateLicense(formulaName: string, partnerName: string): void {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 297, 210, "F");

  doc.setTextColor(218, 165, 32);
  doc.setFontSize(30);
  doc.text("CERTIFICADO DE LICENCIAMENTO", 148, 50, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("A ChemVault Global certifica que a fórmula:", 148, 80, { align: "center" });

  doc.setFontSize(22);
  doc.text(formulaName.toUpperCase(), 148, 100, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Propriedade Intelectual: ${partnerName}`, 148, 130, { align: "center" });
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString()}`, 148, 140, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Powered by lenosoftware.com", 148, 190, { align: "center" });

  const safeFileStem = formulaName.replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
  doc.save(`Licenca_${safeFileStem || "formula"}.pdf`);
}
