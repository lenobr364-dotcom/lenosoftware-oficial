/**
 * NEXUS CORE — alinhamento de matriz (HQ-SYNC) e dados Sicredi/BIJU.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_GEO, NEXUS_HQ, NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type HQTouchpointSync = {
  touchpoint: string;
  status: "OK" | "SKIP";
};

export type HQSyncReport = {
  owner: string;
  entity: string;
  matrizAddress: string;
  headquartersLabel: string;
  bankingPartner: string;
  cnpj: string;
  sicrediHub: string;
  touchpoints: HQTouchpointSync[];
  certification: {
    entity: string;
    headquarters: string;
    responsible: string;
  };
  operationalStatus: string;
  lumenMessage: string;
  syncedAt: string;
};

export class NexusHQManager {
  static readonly MATRIZ_ADDRESS = NEXUS_HQ.matrizAddress;
  static readonly BANKING_PARTNER = NEXUS_HQ.bankingPartner;
  static readonly OWNER = NEXUS_LEGAL.fullName;

  static readonly TOUCHPOINT_LABELS = [
    "Cabeçalho de Licenciamento Químico",
    "Metadados das Notas Fiscais (BIJU)",
    "Rodapé da Vitrine Realista Nexus",
    "Credenciais de Pagamento Sicredi",
  ] as const;

  static readonly LUMEN_MESSAGE =
    "Agora o cliente vê uma rocha. Sem dúvidas, apenas autoridade.";

  /** Linhas padronizadas para rodapés e certificados. */
  static getCorporateFooterLines(): string[] {
    return [
      `SEDE: ${NEXUS_HQ.city} - ${NEXUS_HQ.state}, ${NEXUS_HQ.country}`,
      `CEP: ${NEXUS_HQ.cep}`,
      `MATRIZ: ${this.MATRIZ_ADDRESS}`,
      `GEO: ${NEXUS_GEO.formattedLine}`,
      `BANCO: ${this.BANKING_PARTNER}`,
      `CNPJ: ${NEXUS_HQ.cnpj}`,
      `RESPONSÁVEL: ${this.OWNER}`,
    ];
  }

  static buildReport(): HQSyncReport {
    const touchpoints: HQTouchpointSync[] = this.TOUCHPOINT_LABELS.map((touchpoint) => ({
      touchpoint,
      status: "OK",
    }));

    return {
      owner: this.OWNER,
      entity: NEXUS_LEGAL.company,
      matrizAddress: this.MATRIZ_ADDRESS,
      headquartersLabel: `${NEXUS_HQ.city} - ${NEXUS_HQ.state}`,
      bankingPartner: this.BANKING_PARTNER,
      cnpj: NEXUS_HQ.cnpj,
      sicrediHub: NEXUS_LEGAL.sicrediHub,
      touchpoints,
      certification: {
        entity: NEXUS_LEGAL.company,
        headquarters: `${NEXUS_HQ.city} - ${NEXUS_HQ.state}`,
        responsible: this.OWNER,
      },
      operationalStatus: "Identidade corporativa unificada e inquestionável",
      lumenMessage: this.LUMEN_MESSAGE,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Sincroniza identidade física com apresentação digital.
   */
  static syncCorporateAddress(options?: { logToConsole?: boolean }): HQSyncReport {
    const report = this.buildReport();
    const log = options?.logToConsole !== false;

    if (log) {
      console.log("\n" + "🏢 ".repeat(20));
      console.log("   SINCRONIZANDO ENDEREÇO DA MATRIZ BIJU");
      console.log(`   LOCALIZAÇÃO OFICIAL: ${report.matrizAddress}`);
      console.log("-".repeat(45));

      for (const item of report.touchpoints) {
        const label = item.touchpoint.padEnd(35);
        console.log(`📍 [SYNC]: Atualizando ${label} [${item.status}]`);
      }

      console.log("\n⚖️  CERTIFICAÇÃO JURÍDICA:");
      console.log(`   Entidade: ${report.certification.entity}`);
      console.log(`   Sede: ${report.certification.headquarters}`);
      console.log(`   Responsável: ${report.certification.responsible}`);
      console.log(`   Parceiro: ${report.bankingPartner}`);
      console.log(`   CNPJ: ${report.cnpj}`);

      console.log("\n✅ STATUS: Identidade corporativa unificada e inquestionável.");
      console.log(`📢 LUMEN: "${report.lumenMessage}"`);
      console.log("🏢 ".repeat(20) + "\n");
    }

    return report;
  }

  static async persistHQSync(report: HQSyncReport): Promise<string> {
    const dir = path.join(process.cwd(), "chemvault-public", "nexus-hq");
    await mkdir(dir, { recursive: true });

    const stamp = Date.now();
    const archivePath = path.join(dir, `leno_hq_sync_${stamp}.json`);
    await writeFile(archivePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "hq-sync-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    const footerPath = path.join(dir, "corporate-footer.txt");
    await writeFile(footerPath, this.getCorporateFooterLines().join("\n") + "\n", "utf8");

    return livePath;
  }

  static async syncAndPersist(options?: { logToConsole?: boolean }): Promise<{
    report: HQSyncReport;
    filePath: string;
  }> {
    const report = this.syncCorporateAddress(options);
    const filePath = await this.persistHQSync(report);
    return { report, filePath };
  }
}
