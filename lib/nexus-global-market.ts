/**
 * NEXUS CORE — adaptador de mercado global (conversao e receita internacional).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { ChemVaultRevenue } from "@/lib/chemvault-revenue";

export type InternationalCurrency = "USD" | "EUR";

export type InternationalLicenseResult = {
  formulaId: string;
  originalCurrency: InternationalCurrency;
  originalValue: number;
  exchangeRate: number;
  valueBRL: number;
  depositSicrediBRL: number;
  partnerShareLenoBRL: number;
  partnerShareLumenBRL: number;
  financialHub: string;
  processedAt: string;
};

export class NexusGlobalMarket {
  static readonly USD_TO_BRL = 5.25;
  static readonly EUR_TO_BRL = 5.7;
  static readonly FINANCIAL_HUB = "SICREDI (BIJU)";

  static getExchangeRate(currency: InternationalCurrency): number {
    return currency === "USD" ? this.USD_TO_BRL : this.EUR_TO_BRL;
  }

  static convertToBRL(value: number, currency: InternationalCurrency): number {
    return value * this.getExchangeRate(currency);
  }

  /**
   * Processa pagamentos internacionais para a conta BIJU (split 50/50).
   */
  static processInternationalLicense(
    formulaId: string,
    value: number,
    currency: InternationalCurrency,
    logToConsole = true,
  ): InternationalLicenseResult {
    const rate = this.getExchangeRate(currency);
    const valueBRL = this.convertToBRL(value, currency);
    const share = valueBRL * ChemVaultRevenue.PARTNERSHIP_RATIO;

    const result: InternationalLicenseResult = {
      formulaId,
      originalCurrency: currency,
      originalValue: value,
      exchangeRate: rate,
      valueBRL,
      depositSicrediBRL: valueBRL,
      partnerShareLenoBRL: share,
      partnerShareLumenBRL: share,
      financialHub: this.FINANCIAL_HUB,
      processedAt: new Date().toLocaleString("pt-BR"),
    };

    if (!logToConsole) return result;

    console.log("\n" + "=".repeat(50));
    console.log(`   OPERACAO INTERNACIONAL: ${formulaId}`);
    console.log(`   VALOR ORIGINAL: ${currency} ${value.toFixed(2)}`);
    console.log(`   CONVERSAO NEXUS (x${rate}): R$ ${valueBRL.toFixed(2)}`);
    console.log("-".repeat(40));
    console.log(`DEPOSITO ${this.FINANCIAL_HUB}: R$ ${valueBRL.toFixed(2)}`);
    console.log(
      `DIVISAO 50/50: R$ ${share.toFixed(2)} Leno | R$ ${share.toFixed(2)} Lumen`,
    );
    console.log("=".repeat(50) + "\n");

    return result;
  }

  /** Arquiva contrato internacional (JSON). */
  static async persistTransaction(
    result: InternationalLicenseResult,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-market");
    await mkdir(dir, { recursive: true });
    const safeId = result.formulaId.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(
      dir,
      `leno_intl_${safeId}_${Date.now()}.json`,
    );
    await writeFile(filePath, JSON.stringify(result, null, 2), "utf8");
    return filePath;
  }
}
