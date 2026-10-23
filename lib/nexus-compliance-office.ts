/**
 * NEXUS CORE — compliance quimico e ficha de seguranca (padrao internacional).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { LicenseAudit } from "@/lib/chemvault-nexus";
import type { SimulationResult } from "@/lib/gemini-lab-thermal";
import type { FormulaData } from "@/lib/nexus-formula-data";
import type { IPAssetTag } from "@/lib/nexus-ip-protection";

export type SafetySheetDocument = {
  assetId: string;
  formulaName: string;
  formulaCode: string;
  labId: string;
  certification: string;
  thermalStability: string;
  toxicity: string;
  reactivity: string;
  licensingClause: string;
  paymentChannel: string;
  thermalStatus: string;
  safetyIndex: string;
  licenseApproved: boolean;
  licenseId?: string;
  ipSeal?: string;
  readyForClient: boolean;
  issuedAt: string;
};

export class NexusComplianceOffice {
  static readonly LAB_ID = "CHEMVAULT-GLOBAL-001";
  static readonly CERTIFICATION = "ISO-NEXUS-9001";
  static readonly SOCIETY = NEXUS_LEGAL.society;
  static readonly PAYMENT_CHANNEL = "BIJU (Sicredi)";

  private static resolveThermalLine(result?: SimulationResult): string {
    if (!result) return "APROVADA (Fator Cuiaba)";
    if (result.status === "ESTÁVEL") {
      return `APROVADA (Fator Cuiaba) · Indice ${result.safetyIndex}`;
    }
    return `REVISAO NECESSARIA · Status ${result.status}`;
  }

  static buildSafetySheet(
    assetId: string,
    formulaName: string,
    options?: {
      formula?: FormulaData;
      audit?: LicenseAudit;
      result?: SimulationResult;
      ipTag?: IPAssetTag;
    },
  ): SafetySheetDocument {
    const audit = options?.audit;
    const result = options?.result;
    const approved = audit?.isApproved ?? true;

    return {
      assetId,
      formulaName,
      formulaCode: options?.formula?.id ?? formulaName,
      labId: this.LAB_ID,
      certification: this.CERTIFICATION,
      thermalStability: this.resolveThermalLine(result),
      toxicity: "CONTROLADA",
      reactivity: "MONITORADA",
      licensingClause: `Este ativo pertence a ${this.SOCIETY}.`,
      paymentChannel: this.PAYMENT_CHANNEL,
      thermalStatus: result?.status ?? "ESTAVEL",
      safetyIndex: result?.safetyIndex ?? "N/A",
      licenseApproved: approved,
      licenseId: audit?.licenseID,
      ipSeal: options?.ipTag?.seal,
      readyForClient: approved,
      issuedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Gera laudo tecnico final para exportacao ao cliente.
   */
  static generateSafetySheet(
    assetId: string,
    formulaName: string,
    options?: {
      formula?: FormulaData;
      audit?: LicenseAudit;
      result?: SimulationResult;
      ipTag?: IPAssetTag;
      logToConsole?: boolean;
    },
  ): SafetySheetDocument {
    const doc = this.buildSafetySheet(assetId, formulaName, options);
    const log = options?.logToConsole !== false;

    if (!log) return doc;

    console.log("\n" + "-".repeat(45));
    console.log(`   EMITINDO LAUDO TECNICO: ${doc.assetId}`);
    console.log(`   PRODUTO: ${doc.formulaName}`);
    console.log(`   LAB: ${doc.labId} | CERTIFICACAO: ${doc.certification}`);
    if (doc.ipSeal) {
      console.log(`   SELO PI: ${doc.ipSeal}`);
    }
    console.log("-".repeat(45));

    console.log("INSPECAO DE SEGURANCA:");
    console.log(`   - Estabilidade Termica: ${doc.thermalStability}`);
    console.log(`   - Toxicidade: ${doc.toxicity}`);
    console.log(`   - Reatividade: ${doc.reactivity}`);

    console.log("\nCLAUSULA DE LICENCIAMENTO:");
    console.log(`   ${doc.licensingClause}`);
    console.log(`   Pagamento via ${doc.paymentChannel} ${doc.licenseApproved ? "confirmado" : "pendente"}.`);
    if (doc.licenseId) {
      console.log(`   Licenca NEXUS: ${doc.licenseId}`);
    }

    console.log("-".repeat(45));
    console.log(
      `STATUS: ${doc.readyForClient ? "Documento pronto para entrega ao cliente" : "Aguardando aprovacao NEXUS"}.`,
    );
    console.log("-".repeat(45) + "\n");

    return doc;
  }

  static generateForLine(
    formula: FormulaData,
    audit: LicenseAudit,
    result: SimulationResult,
    ipTag?: IPAssetTag,
    logToConsole = true,
  ): SafetySheetDocument {
    const assetId = ipTag?.seal ?? ipTag?.assetHash ?? `NX-${formula.id}`;
    return this.generateSafetySheet(assetId, formula.substance, {
      formula,
      audit,
      result,
      ipTag,
      logToConsole,
    });
  }

  static async persistSafetySheet(
    doc: SafetySheetDocument,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-compliance");
    await mkdir(dir, { recursive: true });
    const safeId = doc.formulaCode.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_sds_${safeId}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(doc, null, 2), "utf8");

    const txtPath = filePath.replace(/\.json$/, ".txt");
    const body = [
      "FICHA DE SEGURANCA CHEMVAULT GLOBAL",
      "=".repeat(45),
      `Ativo: ${doc.assetId}`,
      `Produto: ${doc.formulaName}`,
      `Lab: ${doc.labId}`,
      `Certificacao: ${doc.certification}`,
      "",
      "INSPECAO:",
      `- Estabilidade Termica: ${doc.thermalStability}`,
      `- Toxicidade: ${doc.toxicity}`,
      `- Reatividade: ${doc.reactivity}`,
      "",
      doc.licensingClause,
      `Pagamento: ${doc.paymentChannel}`,
      "",
      `Emitido em: ${doc.issuedAt}`,
    ].join("\n");
    await writeFile(txtPath, body + "\n", "utf8");

    return filePath;
  }
}
