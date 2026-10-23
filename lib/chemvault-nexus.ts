/**
 * NEXUS — licenciamento ChemVault condicionado à segurança térmica do Lab Digital.
 */

import type { SimulationResult } from "@/lib/gemini-lab-thermal";

export interface LicenseAudit {
  licenseID: string;
  isApproved: boolean;
  reason: string;
  timestamp: string;
}

export class ChemVaultNexus {
  /** Padrão ouro ChemVault — índice mínimo para catálogo global. */
  static readonly MIN_SAFETY_INDEX = 75.0;

  static processLicensing(result: SimulationResult): LicenseAudit {
    const safetyValue = parseFloat(result.safetyIndex.replace("%", ""));
    const approved =
      Number.isFinite(safetyValue) &&
      safetyValue >= this.MIN_SAFETY_INDEX &&
      result.status === "ESTÁVEL";

    const reason = approved
      ? "Fórmula aprovada: Alta estabilidade térmica e segurança de fulgor garantida."
      : result.status !== "ESTÁVEL"
        ? `Licenciamento negado: Status térmico [${result.status}] — requer ESTÁVEL.`
        : `Licenciamento negado: Índice de segurança (${result.safetyIndex}) abaixo do padrão Nexus (mín. ${this.MIN_SAFETY_INDEX}%).`;

    return {
      licenseID: `CV-GLOBAL-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
      isApproved: approved,
      reason,
      timestamp: new Date().toLocaleString("pt-BR"),
    };
  }
}
