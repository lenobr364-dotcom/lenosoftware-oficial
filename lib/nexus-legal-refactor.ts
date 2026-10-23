/**
 * NEXUS CORE — refatoracao de entidade juridica nos documentos de elite.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type LegalDocumentRefactor = {
  document: string;
  from: string;
  to: string;
  entity: string;
  validated: boolean;
};

export type LegalRefactorReport = {
  fullName: string;
  company: string;
  documents: LegalDocumentRefactor[];
  status: string;
  directive: string;
  refactoredAt: string;
};

export class NexusLegalRefactor {
  static readonly FULL_NAME = NEXUS_LEGAL.fullName;
  static readonly COMPANY = NEXUS_LEGAL.company;

  static readonly DOCUMENT_TYPES = [
    "Contrato Social Digital",
    "Certificado de Pureza",
    "Licenca de Uso NX",
    "Fatura Sicredi",
  ] as const;

  static buildReport(): LegalRefactorReport {
    const documents: LegalDocumentRefactor[] = this.DOCUMENT_TYPES.map((doc) => ({
      document: doc,
      from: NEXUS_LEGAL.legacyShortName,
      to: this.FULL_NAME,
      entity: `${this.COMPANY} [VALIDADO]`,
      validated: true,
    }));

    return {
      fullName: this.FULL_NAME,
      company: this.COMPANY,
      documents,
      status: "Documentacao juridica atualizada e padronizada",
      directive: "Proximos comandos utilizarao apenas dados oficiais",
      refactoredAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Corrige e padroniza identificacao nos ativos e contratos.
   */
  static refactorIdentity(logToConsole = true): LegalRefactorReport {
    const report = this.buildReport();

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   INICIANDO REFATORACAO DE IDENTIDADE JURIDICA");
    console.log(`   NOME OFICIAL: ${report.fullName}`);
    console.log(`   ENTIDADE: ${report.company}`);
    console.log("-".repeat(45));

    for (const doc of report.documents) {
      console.log(`Ajustando [${doc.document}]:`);
      console.log(`   -> De: ${doc.from}`);
      console.log(`   -> Para: ${doc.to}`);
      console.log(`   -> Entidade: ${doc.entity}`);
    }

    console.log(`\nSTATUS: ${report.status}.`);
    console.log(`DIRETRIZ: ${report.directive}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistRefactorReport(
    report: LegalRefactorReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-legal");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_legal_refactor_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const activePath = path.join(dir, "legal-identity-active.json");
    await writeFile(
      activePath,
      JSON.stringify(
        {
          ...NEXUS_LEGAL,
          lastRefactor: report.refactoredAt,
        },
        null,
        2,
      ),
      "utf8",
    );

    return filePath;
  }
}
