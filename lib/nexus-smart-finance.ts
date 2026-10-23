/**
 * NEXUS CORE — precificacao inteligente e contrato simulado (recebimento BIJU).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { LicenseAudit } from "@/lib/chemvault-nexus";
import { ChemVaultRevenue } from "@/lib/chemvault-revenue";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import {
  computeGrantHash,
  computeSimulatedChainAnchor,
  SIMULATED_FORMULA_LICENSE_CONTRACT_ID,
  type GrantCanonicalPayload,
} from "@/lib/formula-license-smart-contract";
import type { FormulaData } from "@/lib/nexus-formula-data";
import type { ChemicalScanResult } from "@/lib/nexus-chemical-scanner";

export type SmartFinanceContract = {
  formulaName: string;
  formulaCode: string;
  complexity: number;
  baseValueBRL: number;
  finalPriceBRL: number;
  partnerShareLenoBRL: number;
  partnerShareLumenBRL: number;
  destination: string;
  favorecido: string;
  grantHash: string;
  chainAnchor: string;
  contractId: string;
  status: string;
  directive: string;
  preparedAt: string;
};

export class NexusSmartFinance {
  static readonly BASE_VALUE_BRL = 5_000;
  static readonly DESTINATION = "SICREDI";
  static readonly FAVORECIDO = "BIJU";
  static readonly OWNER_LENO = NEXUS_LEGAL.fullName;
  static readonly OWNER_LUMEN = NEXUS_LEGAL.partnerLumen;

  static resolveComplexity(
    complexity?: number,
    formula?: FormulaData,
    scan?: ChemicalScanResult,
  ): number {
    if (complexity !== undefined && complexity > 0) return complexity;
    if (scan) {
      return Math.round((scan.purityPercent / 40) * 10) / 10;
    }
    if (formula) {
      const factor = formula.viscosity_g_cm3 * (formula.criticalFlashPointC / 100);
      return Math.max(1, Math.round(factor * 10) / 10);
    }
    return 1;
  }

  static buildContract(
    formulaName: string,
    complexity: number,
    formulaCode = formulaName,
    clientSubject = "BIJU",
  ): SmartFinanceContract {
    const finalPriceBRL = this.BASE_VALUE_BRL * complexity;
    const share = finalPriceBRL * ChemVaultRevenue.PARTNERSHIP_RATIO;

    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const payload: GrantCanonicalPayload = {
      contractId: SIMULATED_FORMULA_LICENSE_CONTRACT_ID,
      clientSubject,
      formulaCode,
      validFromIso: validFrom.toISOString(),
      validUntilIso: validUntil.toISOString(),
    };

    const grantHash = computeGrantHash(payload);
    const chainAnchor = computeSimulatedChainAnchor(grantHash);

    return {
      formulaName,
      formulaCode,
      complexity,
      baseValueBRL: this.BASE_VALUE_BRL,
      finalPriceBRL,
      partnerShareLenoBRL: share,
      partnerShareLumenBRL: share,
      destination: this.DESTINATION,
      favorecido: this.FAVORECIDO,
      grantHash,
      chainAnchor,
      contractId: SIMULATED_FORMULA_LICENSE_CONTRACT_ID,
      status: "Pronto para envio ao cliente",
      directive: "Pagamento identificado, formula liberada.",
      preparedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Calcula valor da licenca e vincula ao Sicredi / BIJU.
   */
  static generateContract(
    formulaName: string,
    complexity: number,
    options?: {
      formulaCode?: string;
      logToConsole?: boolean;
    },
  ): SmartFinanceContract {
    const contract = this.buildContract(
      formulaName,
      complexity,
      options?.formulaCode ?? formulaName,
    );

    if (options?.logToConsole === false) return contract;

    console.log("\n" + "=".repeat(50));
    console.log(`   CONTRATO INTELIGENTE: ${contract.formulaName}`);
    console.log(`   VALOR DO LICENCIAMENTO: R$ ${contract.finalPriceBRL.toFixed(2)}`);
    console.log("-".repeat(40));
    console.log(`DESTINO: ${contract.destination} | FAVORECIDO: ${contract.favorecido}`);
    console.log("DIVISAO SOCIEDADE:");
    console.log(`   - ${this.OWNER_LENO} (50%): R$ ${contract.partnerShareLenoBRL.toFixed(2)}`);
    console.log(`   - ${this.OWNER_LUMEN} (50%): R$ ${contract.partnerShareLumenBRL.toFixed(2)}`);
    console.log(`\nANCHOR: ${contract.chainAnchor}`);
    console.log(`HASH: ${contract.grantHash.slice(0, 24)}...`);
    console.log(`\nSTATUS: Contrato ${contract.status.toLowerCase()}.`);
    console.log(`DIRETRIZ: ${contract.directive}`);
    console.log("=".repeat(50) + "\n");

    return contract;
  }

  static generateForApproved(
    formula: FormulaData,
    audit: LicenseAudit,
    scan?: ChemicalScanResult,
    logToConsole = true,
  ): SmartFinanceContract | null {
    if (!audit.isApproved) return null;
    const complexity = this.resolveComplexity(undefined, formula, scan);
    return this.generateContract(formula.substance, complexity, {
      formulaCode: formula.id,
      logToConsole,
    });
  }

  static async persistContract(
    contract: SmartFinanceContract,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-contracts");
    await mkdir(dir, { recursive: true });
    const safeCode = contract.formulaCode.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_contract_${safeCode}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(contract, null, 2), "utf8");
    return filePath;
  }
}
