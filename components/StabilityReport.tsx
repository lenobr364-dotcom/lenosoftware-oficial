"use client";

import { jsPDF } from "jspdf";

export interface StabilityData {
  tempo: number;
  estabilidade: number;
}

interface Props {
  formulaName: string;
  data: StabilityData[];
}

export default function StabilityReport({ formulaName, data }: Props) {
  function exportPDF() {
    const doc = new jsPDF();

    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(22);
    doc.text("CHEMVAULT GLOBAL", 105, 25, { align: "center" });

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text("RELATÓRIO TÉCNICO DE ESTABILIDADE", 105, 55, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Fórmula: ${formulaName}`, 20, 75);
    doc.text(`Data da Simulação: ${new Date().toLocaleDateString()}`, 20, 85);

    doc.setFillColor(240, 240, 240);
    doc.rect(20, 95, 170, 10, "F");
    doc.text("Tempo (min)", 30, 102);
    doc.text("Estabilidade (%)", 120, 102);

    data.forEach((item, index) => {
      const y = 115 + index * 10;
      doc.text(`${item.tempo} min`, 30, y);
      doc.text(`${item.estabilidade}%`, 120, y);
    });

    doc.setFontSize(10);
    doc.text("© 2026 Leno César & Lumen Onel - All Rights Reserved", 105, 280, { align: "center" });

    const safe = formulaName.replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
    doc.save(`Relatorio_${safe || "formula"}.pdf`);
  }

  return (
    <button
      type="button"
      onClick={exportPDF}
      className="mt-6 w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-4 text-[10px] font-bold uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/20"
    >
      Exportar Relatório Técnico (PDF)
    </button>
  );
}
