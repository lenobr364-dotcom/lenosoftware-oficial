/**
 * NEXUS CORE — processamento global em lote e consolidação de ativos (sociedade 50/50).
 */

import { ChemVaultNexus, type LicenseAudit } from "@/lib/chemvault-nexus";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import { ChemVaultRevenue } from "@/lib/chemvault-revenue";
import {
  NexusEnvironmentShield,
  type GeoClimate,
} from "@/lib/nexus-environment-shield";
import type { FormulaData } from "@/lib/nexus-formula-data";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";
import { ThermalService } from "@/lib/thermal-service";

export type BatchLineResult = {
  formula: FormulaData;
  result: SimulationResult;
  audit: LicenseAudit;
  licenseFeeBRL: number;
  credited: boolean;
};

export type GlobalBatchBalance = {
  totalFormulas: number;
  approvedCount: number;
  grossRevenueBRL: number;
  operationalCostBRL: number;
  netLabIncomeBRL: number;
  partnerShareLenoBRL: number;
  partnerShareLumenBRL: number;
  lines: BatchLineResult[];
};

export class NexusGlobalProcessor {
  static readonly DEFAULT_LICENSE_FEE_BRL = 5_000;

  static processFormula(
    formula: FormulaData,
    options?: { climate?: GeoClimate; logToConsole?: boolean },
  ): BatchLineResult {
    const log = options?.logToConsole === true;
    const ambient =
      options?.climate?.currentTempC ?? formula.ambientTempC ?? ThermalService.DEFAULT_AMBIENT_C;
    const result = ThermalService.analyze({ ...formula, ambientTempC: ambient });
    let audit: LicenseAudit;
    let licensedResult = result;

    if (options?.climate) {
      const shielded = NexusEnvironmentShield.processShieldedLicensing(
        result,
        options.climate,
        log,
      );
      audit = shielded.audit;
      licensedResult = shielded.shieldedResult;
    } else {
      audit = ChemVaultNexus.processLicensing(result);
    }

    const licenseFeeBRL = formula.licenseFeeBRL ?? this.DEFAULT_LICENSE_FEE_BRL;
    const credited = audit.isApproved;

    if (log) {
      console.log(`\nPROVETA: ${formula.id} | SUBSTANCIA: ${formula.substance}`);
      console.log(`STATUS: ${result.status} | SEGURANCA: ${result.safetyIndex}`);
      if (credited) {
        console.log(`NEXUS: APROVADO [ID: ${audit.licenseID}] · R$ ${licenseFeeBRL.toFixed(2)}`);
      } else {
        console.log(`NEXUS: REJEITADO - ${audit.reason}`);
      }
    }

    return { formula, result: licensedResult, audit, licenseFeeBRL, credited };
  }

  static consolidateBatch(
    lines: BatchLineResult[],
    operationalCostBRL: number,
    logToConsole: boolean,
  ): GlobalBatchBalance {
    const grossRevenueBRL = lines
      .filter((l) => l.credited)
      .reduce((sum, l) => sum + l.licenseFeeBRL, 0);
    const approvedCount = lines.filter((l) => l.credited).length;
    const netLabIncomeBRL = Math.max(grossRevenueBRL - operationalCostBRL, 0);
    const share = netLabIncomeBRL * ChemVaultRevenue.PARTNERSHIP_RATIO;

    const balance: GlobalBatchBalance = {
      totalFormulas: lines.length,
      approvedCount,
      grossRevenueBRL,
      operationalCostBRL,
      netLabIncomeBRL,
      partnerShareLenoBRL: share,
      partnerShareLumenBRL: share,
      lines,
    };

    if (logToConsole) {
      this.renderFinalBalance(balance);
    }

    return balance;
  }

  /**
   * Processa formulas em paralelo (modo turbo).
   */
  static async runBatchSimulationParallel(
    formulas: FormulaData[],
    options?: {
      operationalCostBRL?: number;
      logToConsole?: boolean;
      climate?: GeoClimate;
    },
  ): Promise<GlobalBatchBalance> {
    const log = options?.logToConsole !== false;
    const operationalCostBRL = options?.operationalCostBRL ?? 0;

    if (log) {
      console.log("\n" + "=".repeat(60));
      console.log("   GEMINI LABS - PROCESSAMENTO PARALELO (TURBO)");
      console.log("=".repeat(60));
    }

    const lines = await Promise.all(
      formulas.map((formula) =>
        Promise.resolve(
          this.processFormula(formula, {
            climate: options?.climate,
            logToConsole: false,
          }),
        ),
      ),
    );

    return this.consolidateBatch(lines, operationalCostBRL, log);
  }

  /**
   * Processa múltiplas fórmulas e devolve balanço consolidado do lote.
   */
  static runBatchSimulation(
    formulas: FormulaData[],
    options?: {
      operationalCostBRL?: number;
      logToConsole?: boolean;
      /** Clima ao vivo — ajusta índice de segurança antes do licenciamento NEXUS. */
      climate?: GeoClimate;
    },
  ): GlobalBatchBalance {
    const log = options?.logToConsole !== false;
    const operationalCostBRL = options?.operationalCostBRL ?? 0;

    if (log) {
      console.log("\n" + "=".repeat(60));
      console.log("   GEMINI LABS - PROCESSAMENTO GLOBAL DE ATIVOS");
      console.log("=".repeat(60));
    }

    const lines = formulas.map((formula) =>
      this.processFormula(formula, {
        climate: options?.climate,
        logToConsole: log,
      }),
    );

    return this.consolidateBatch(lines, operationalCostBRL, log);
  }

  static renderFinalBalance(balance: GlobalBatchBalance): void {
    console.log("\n" + "-".repeat(60));
    console.log(
      `RESUMO DO LOTE: ${balance.approvedCount}/${balance.totalFormulas} Formulas Licenciadas`,
    );
    console.log(`FATURAMENTO BRUTO (lab): R$ ${balance.grossRevenueBRL.toFixed(2)}`);
    if (balance.operationalCostBRL > 0) {
      console.log(`CUSTO OPERACIONAL LOTE: R$ ${balance.operationalCostBRL.toFixed(2)}`);
      console.log(`LIQUIDO LAB: R$ ${balance.netLabIncomeBRL.toFixed(2)}`);
    }
    console.log("DISTRIBUICAO SOCIEDADE (50/50):");
    console.log(`   - ${NEXUS_LEGAL.fullName}: R$ ${balance.partnerShareLenoBRL.toFixed(2)}`);
    console.log(`   - ${NEXUS_LEGAL.partnerLumen}: R$ ${balance.partnerShareLumenBRL.toFixed(2)}`);
    console.log("=".repeat(60) + "\n");
  }
}
