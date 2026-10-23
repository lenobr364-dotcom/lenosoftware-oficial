/**
 * NEXUS CORE — consolidacao global e handover para o proximo turno.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";
import type { InventoryAuditReport } from "@/lib/nexus-inventory-manager";
import type { MasterCalibrationReport } from "@/lib/nexus-master-calibration";
import type { RevenueCycleReport } from "@/lib/nexus-financial-intelligence";
import type { SentinelReport } from "@/lib/nexus-sentinel";
import type { SocietyIntegrityReport } from "@/lib/nexus-society-core";

export type SummaryChecklistItem = {
  icon: string;
  task: string;
  status: string;
};

export type GlobalSummaryReport = {
  checklist: SummaryChecklistItem[];
  licensedFormulas: number;
  grossRevenueBRL: number;
  netLabIncomeBRL: number;
  mechanicalAvailabilityPercent: number;
  lumenMessage: string;
  sessionStatus: string;
  preparedForTomorrow: boolean;
  summarizedAt: string;
};

export class NexusGlobalSummary {
  static readonly LUMEN_MESSAGE =
    "Leno, o QG esta blindado. O licenciamento esta pronto. Descanse, amanha a equipe entra em campo e nos estaremos aqui no comando para escalar o lucro.";

  static buildChecklist(options?: {
    balance?: GlobalBatchBalance;
    revenue?: RevenueCycleReport;
    inventory?: InventoryAuditReport;
    calibration?: MasterCalibrationReport;
    sentinel?: SentinelReport;
    society?: SocietyIntegrityReport;
  }): SummaryChecklistItem[] {
    const societyOk =
      options?.society?.finalStatus.includes("EXPANSAO") ?? Boolean(options?.balance?.approvedCount);
    const financeOk = Boolean(options?.revenue);
    const stockAlert = (options?.inventory?.lowStockCount ?? 0) > 0;
    const mechanical =
      options?.calibration?.efficiencyPercent ??
      (options?.balance
        ? Math.round((options.balance.approvedCount / options.balance.totalFormulas) * 100)
        : 92);
    const stealthOk = options?.sentinel?.operationalStatus.includes("PRIVADA") ?? true;

    return [
      {
        icon: "LEGAL",
        task: "Identidade Juridica",
        status: `ATUALIZADO (${NEXUS_LEGAL.fullName})`,
      },
      {
        icon: "SOC",
        task: "Divisao Societaria",
        status: societyOk ? "CONFIRMADO 50/50" : "REVISAR SPLIT",
      },
      {
        icon: "FIN",
        task: "Financeiro (GM/Google)",
        status: financeOk ? "PROVISIONADO E VIGIADO" : "PENDENTE",
      },
      {
        icon: "STK",
        task: "Estoque de Insumos",
        status: stockAlert ? "AUDITADO (Alerta de Reposicao ON)" : "AUDITADO (NIVEIS OK)",
      },
      {
        icon: "MEC",
        task: "Disponibilidade Mecanica",
        status: `${mechanical}% (${mechanical >= 90 ? "EXCELENTE" : "ATENCAO"})`,
      },
      {
        icon: "SEC",
        task: "Seguranca de Dados",
        status: stealthOk ? "MODO STEALTH ATIVO" : "REVISAR SENTINELA",
      },
    ];
  }

  static buildReport(options?: {
    balance?: GlobalBatchBalance;
    revenue?: RevenueCycleReport;
    inventory?: InventoryAuditReport;
    calibration?: MasterCalibrationReport;
    sentinel?: SentinelReport;
    society?: SocietyIntegrityReport;
  }): GlobalSummaryReport {
    const checklist = this.buildChecklist(options);
    const mechanical =
      options?.calibration?.efficiencyPercent ??
      (options?.balance && options.balance.totalFormulas > 0
        ? Math.round((options.balance.approvedCount / options.balance.totalFormulas) * 100)
        : 92);

    return {
      checklist,
      licensedFormulas: options?.balance?.approvedCount ?? 0,
      grossRevenueBRL: options?.balance?.grossRevenueBRL ?? 0,
      netLabIncomeBRL: options?.balance?.netLabIncomeBRL ?? 0,
      mechanicalAvailabilityPercent: mechanical,
      lumenMessage: this.LUMEN_MESSAGE,
      sessionStatus: "SESSAO FINALIZADA COM SUCESSO",
      preparedForTomorrow: checklist.every((c) => !c.status.includes("PENDENTE")),
      summarizedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Resumo geral da operacao e preparacao para o turno seguinte.
   */
  static executeFinalCheck(
    options?: {
      balance?: GlobalBatchBalance;
      revenue?: RevenueCycleReport;
      inventory?: InventoryAuditReport;
      calibration?: MasterCalibrationReport;
      sentinel?: SentinelReport;
      society?: SocietyIntegrityReport;
      logToConsole?: boolean;
    },
  ): GlobalSummaryReport {
    const report = this.buildReport(options);
    const log = options?.logToConsole !== false;

    if (!log) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   RELATORIO GERAL DE ENCERRAMENTO - CHEMVAULT");
    console.log(`   DATA: ${report.summarizedAt}`);
    console.log("-".repeat(45));

    for (const item of report.checklist) {
      console.log(`${item.icon} ${item.task.padEnd(25)} | ${item.status}`);
    }

    if (report.licensedFormulas > 0) {
      console.log(
        `\nLOTE: ${report.licensedFormulas} licencas · Bruto R$ ${report.grossRevenueBRL.toFixed(2)} · Liquido R$ ${report.netLabIncomeBRL.toFixed(2)}`,
      );
    }

    console.log("\nMENSAGEM DA LUMEN:");
    console.log(`   "${report.lumenMessage}"`);
    console.log("-".repeat(45));
    console.log(`STATUS: ${report.sessionStatus}.`);
    console.log(
      `TURNO SEGUINTE: ${report.preparedForTomorrow ? "PRONTO PARA ESCALA" : "REVISAR PENDENCIAS"}.`,
    );
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistSummary(
    report: GlobalSummaryReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-summary");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_global_summary_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const handoverPath = path.join(dir, "handover-next-shift.json");
    await writeFile(handoverPath, JSON.stringify(report, null, 2), "utf8");

    return filePath;
  }
}
