/**
 * NEXUS CORE — emissor de licenca comercial global (pos-confirmacao BIJU).
 */

import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { LicenseAudit } from "@/lib/chemvault-nexus";
import type { FormulaData } from "@/lib/nexus-formula-data";
import type { IPAssetTag } from "@/lib/nexus-ip-protection";
import type { SmartFinanceContract } from "@/lib/nexus-smart-finance";

export type CommercialLicense = {
  licenseKey: string;
  authority: string;
  clientName: string;
  assetId: string;
  formulaCode?: string;
  formulaName?: string;
  terms: string;
  financialChannel: string;
  nexusLicenseId?: string;
  grantHash?: string;
  chainAnchor?: string;
  ipSeal?: string;
  bijuConfirmed: boolean;
  status: string;
  notice: string;
  issuedAt: string;
};

export class NexusLicenseEmitter {
  static readonly AUTHORITY = "CHEMVAULT GLOBAL LAB";
  static readonly TERMS = `Licenca de uso exclusivo. Propriedade de ${NEXUS_LEGAL.partnership}.`;
  static readonly FINANCIAL_CHANNEL = "Recebimento liquidado via BIJU/Sicredi";
  static readonly DEFAULT_CLIENT = "INDUSTRIA QUIMICA GLOBAL";

  private static generateLicenseKey(): string {
    return `LIC-${randomBytes(4).toString("hex").toUpperCase()}`;
  }

  static buildLicense(
    clientName: string,
    assetId: string,
    options?: {
      formula?: FormulaData;
      audit?: LicenseAudit;
      contract?: SmartFinanceContract;
      ipTag?: IPAssetTag;
      bijuConfirmed?: boolean;
    },
  ): CommercialLicense {
    const bijuConfirmed = options?.bijuConfirmed ?? true;

    return {
      licenseKey: this.generateLicenseKey(),
      authority: this.AUTHORITY,
      clientName,
      assetId,
      formulaCode: options?.formula?.id,
      formulaName: options?.formula?.substance,
      terms: this.TERMS,
      financialChannel: this.FINANCIAL_CHANNEL,
      nexusLicenseId: options?.audit?.licenseID,
      grantHash: options?.contract?.grantHash,
      chainAnchor: options?.contract?.chainAnchor,
      ipSeal: options?.ipTag?.seal,
      bijuConfirmed,
      status: bijuConfirmed
        ? "Licenca enviada com sucesso"
        : "Aguardando confirmacao BIJU",
      notice: "O ativo agora esta operacional sob custodia do cliente.",
      issuedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Emite licenca comercial final para o cliente.
   */
  static emitLicense(
    clientName: string,
    assetId: string,
    options?: {
      formula?: FormulaData;
      audit?: LicenseAudit;
      contract?: SmartFinanceContract;
      ipTag?: IPAssetTag;
      bijuConfirmed?: boolean;
      logToConsole?: boolean;
    },
  ): CommercialLicense | null {
    if (options?.audit && !options.audit.isApproved) {
      if (options?.logToConsole !== false) {
        console.log(`\nLicenca nao emitida para ${assetId}: NEXUS nao aprovou o ativo.`);
      }
      return null;
    }

    const license = this.buildLicense(clientName, assetId, options);
    const log = options?.logToConsole !== false;

    if (!log) return license;

    console.log("\n" + "-".repeat(45));
    console.log("   EMISSAO DE LICENCA COMERCIAL");
    console.log(`   AUTORIDADE: ${license.authority}`);
    console.log(`   CLIENTE: ${license.clientName}`);
    console.log(`   ATIVO VINCULADO: ${license.assetId}`);
    if (license.formulaName) {
      console.log(`   FORMULA: ${license.formulaName}`);
    }
    console.log("-".repeat(45));
    console.log(`CHAVE DE ACESSO: ${license.licenseKey}`);
    console.log(`TERMOS: ${license.terms}`);
    console.log(`FINANCEIRO: ${license.financialChannel}`);
    if (license.nexusLicenseId) {
      console.log(`NEXUS ID: ${license.nexusLicenseId}`);
    }
    if (license.ipSeal) {
      console.log(`SELO PI: ${license.ipSeal}`);
    }
    console.log(`\nSTATUS: ${license.status}.`);
    console.log(`AVISO: ${license.notice}`);
    console.log("-".repeat(45) + "\n");

    return license;
  }

  static emitForApprovedLine(
    clientName: string,
    formula: FormulaData,
    audit: LicenseAudit,
    options?: {
      contract?: SmartFinanceContract;
      ipTag?: IPAssetTag;
      logToConsole?: boolean;
    },
  ): CommercialLicense | null {
    const assetId = options?.ipTag?.seal ?? options?.ipTag?.assetHash ?? formula.id;
    return this.emitLicense(clientName, assetId, {
      formula,
      audit,
      contract: options?.contract,
      ipTag: options?.ipTag,
      bijuConfirmed: true,
      logToConsole: options?.logToConsole,
    });
  }

  static async persistLicense(
    license: CommercialLicense,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-licenses");
    await mkdir(dir, { recursive: true });
    const safeKey = license.licenseKey.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_license_${safeKey}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(license, null, 2), "utf8");
    return filePath;
  }
}
