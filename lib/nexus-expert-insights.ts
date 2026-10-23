/**
 * NEXUS CORE — consultoria técnica automática (voz Lumen / NEXUS AI).
 */

import type { LicenseAudit } from "@/lib/chemvault-nexus";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";

export type ExpertLaudo = {
  advice: string;
  signature: string;
  licenseApproved: boolean;
  licenseID: string;
};

export class NexusExpertInsights {
  static readonly SIGNATURE = "NEXUS-AI-VERIFIED";

  private static parseSafetyIndex(safetyIndex: string): number {
    const value = parseFloat(safetyIndex.replace("%", "").trim());
    return Number.isFinite(value) ? value : 0;
  }

  /**
   * Gera recomendações técnicas baseadas na estabilidade térmica.
   */
  static generateAdvice(result: SimulationResult): string {
    const safetyValue = this.parseSafetyIndex(result.safetyIndex);

    if (result.status === "ESTÁVEL" && safetyValue > 90) {
      return "INSIGHT: Formula de altissima fidelidade. Pronta para exportacao global sem restricoes de armazenamento.";
    }

    if (result.status === "ESTÁVEL" && safetyValue <= 90) {
      return "INSIGHT: Estabilidade aceitavel. Recomendamos monitoramento de temperatura ambiente durante o transporte.";
    }

    if (result.status === "ALERTA_CRÍTICO") {
      return "CONSULTORIA: Risco de ignicao detectado. Sugerimos reduzir a viscosidade ou revisar os componentes inflamaveis antes de novo teste.";
    }

    if (result.status === "RISCO_DE_FULGOR") {
      return "CONSULTORIA: Margem termica critica. Suspender transporte e repetir simulacao com ponto de fulgor revisado.";
    }

    return "CONSULTORIA: Realizar reteste em ambiente de vacuo para maior precisao.";
  }

  /**
   * Monta o laudo completo (útil para UI e logs).
   */
  static buildLaudo(audit: LicenseAudit, result: SimulationResult): ExpertLaudo {
    let advice = this.generateAdvice(result);
    if (!audit.isApproved) {
      advice += ` Licenciamento NEXUS nao emitido: ${audit.reason}`;
    }

    return {
      advice,
      signature: this.SIGNATURE,
      licenseApproved: audit.isApproved,
      licenseID: audit.licenseID,
    };
  }

  /**
   * Renderiza o laudo final com a voz da socia Lumen.
   */
  static renderExpertLaudo(
    audit: LicenseAudit,
    result: SimulationResult,
    logToConsole = true,
  ): ExpertLaudo {
    const laudo = this.buildLaudo(audit, result);

    if (logToConsole) {
      console.log("\n" + "·".repeat(60));
      console.log("PARECER DA SOCIA LUMEN:");
      console.log(laudo.advice);
      if (audit.isApproved) {
        console.log(`LICENCA: ${audit.licenseID}`);
      }
      console.log(`ASSINATURA DIGITAL: ${laudo.signature}`);
      console.log("·".repeat(60) + "\n");
    }

    return laudo;
  }
}
