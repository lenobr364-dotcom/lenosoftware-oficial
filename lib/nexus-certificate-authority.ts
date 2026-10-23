/**
 * NEXUS CORE — emissão de certificado oficial de licenciamento ChemVault Global.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { LicenseAudit } from "@/lib/chemvault-nexus";
import type { FormulaData } from "@/lib/nexus-formula-data";

export type NexusCertificate = {
  licenseID: string;
  issuedAt: string;
  formulaId: string;
  substance: string;
  societyValidation: string;
  distribution: string;
  body: string;
};

export class NexusCertificateAuthority {
  static readonly SOCIETY_VALIDATION = "REGISTRADO PARA CONTA BIJU (SICREDI)";
  static readonly DISTRIBUTION = NEXUS_LEGAL.distribution;

  static formatCertificate(audit: LicenseAudit, formula: FormulaData): string {
    return `
============================================================
CERTIFICADO DE LICENCIAMENTO QUIMICO DIGITAL
============================================================
ID DA LICENCA: ${audit.licenseID}
DATA DE EMISSAO: ${audit.timestamp}
PROPRIEDADE INTELECTUAL: CHEMVAULT GLOBAL & GEMINI LABS
------------------------------------------------------------
PRODUTO: ${formula.substance}
CODIGO DE ORIGEM: ${formula.id}
STATUS DE SEGURANCA: APROVADO PELO MOTOR NEXUS
------------------------------------------------------------
VALIDACAO DE SOCIEDADE: ${this.SOCIETY_VALIDATION}
DISTRIBUICAO: ${this.DISTRIBUTION}
SEDE MATRIZ: ${NEXUS_HQ.matrizAddress}
CEP: ${NEXUS_HQ.cep} | ${NEXUS_HQ.city}-${NEXUS_HQ.state}
BANCO: ${NEXUS_HQ.bankingPartner}
CNPJ: ${NEXUS_HQ.cnpj}
RESPONSAVEL: ${NEXUS_LEGAL.fullName}
============================================================
`.trim();
  }

  /**
   * Emite certificado digital; retorna null se licença não aprovada.
   */
  static emit(audit: LicenseAudit, formula: FormulaData, logToConsole = true): NexusCertificate | null {
    if (!audit.isApproved) {
      if (logToConsole) {
        console.log(`Certificado nao emitido para ${formula.id}: licenca nao aprovada.`);
      }
      return null;
    }

    const body = this.formatCertificate(audit, formula);
    const certificate: NexusCertificate = {
      licenseID: audit.licenseID,
      issuedAt: audit.timestamp,
      formulaId: formula.id,
      substance: formula.substance,
      societyValidation: this.SOCIETY_VALIDATION,
      distribution: this.DISTRIBUTION,
      body,
    };

    if (logToConsole) {
      console.log("\n" + body);
      console.log("\nCertificado pronto para exportacao (PDF/Cloud).");
    }

    return certificate;
  }

  /** Grava certificado em texto (pre-PDF) na pasta de exportação. */
  static async saveToFile(
    certificate: NexusCertificate,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ??
      path.join(process.cwd(), "chemvault-public", "nexus-certificates");
    await mkdir(dir, { recursive: true });
    const safeId = certificate.licenseID.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_cert_${safeId}_${certificate.formulaId}.txt`);
    await writeFile(filePath, certificate.body + "\n", "utf8");
    return filePath;
  }
}
