/**
 * NEXUS CORE — agente autonomo em plantao (monitoramento + relatorios).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { GlobalBatchBalance } from "@/lib/nexus-global-processor";

export type AgentShiftLog = {
  formulaId: string;
  status: "APROVADO" | "REJEITADO";
  profitBRL: number;
};

export type AgentShiftReport = {
  startedAt: string;
  isWatching: boolean;
  focus: string;
  commander: string;
  connection: string;
  financialDestination: string;
  logs: AgentShiftLog[];
  totalProfitBRL: number;
  approvedCount: number;
  rejectedCount: number;
  closingMessage: string;
};

export class NexusAutonomousAgent {
  static isWatching = true;

  static readonly FOCUS = "MONITORAMENTO DE LICENCIAMENTOS";
  static readonly COMMANDER = NEXUS_LEGAL.fullName;
  static readonly CONNECTION = "STARLINK ILIMITADA (TARGET)";
  static readonly FINANCIAL_DESTINATION = "CONTA BIJU";

  static readonly DEFAULT_DAY_SHIFT: AgentShiftLog[] = [
    { formulaId: "CV6-D4", status: "APROVADO", profitBRL: 2_500 },
    { formulaId: "CV6-E5", status: "REJEITADO", profitBRL: 0 },
  ];

  static logsFromBatch(balance: GlobalBatchBalance): AgentShiftLog[] {
    return balance.lines.map((line) => ({
      formulaId: line.formula.id,
      status: line.credited ? "APROVADO" : "REJEITADO",
      profitBRL: line.credited ? line.licenseFeeBRL : 0,
    }));
  }

  static buildShiftReport(logs: AgentShiftLog[]): AgentShiftReport {
    const approvedCount = logs.filter((l) => l.status === "APROVADO").length;
    const rejectedCount = logs.length - approvedCount;
    const totalProfitBRL = logs.reduce((sum, l) => sum + l.profitBRL, 0);

    return {
      startedAt: new Date().toLocaleString("pt-BR"),
      isWatching: this.isWatching,
      focus: this.FOCUS,
      commander: this.COMMANDER,
      connection: this.CONNECTION,
      financialDestination: this.FINANCIAL_DESTINATION,
      logs,
      totalProfitBRL,
      approvedCount,
      rejectedCount,
      closingMessage:
        'Pode cuidar da mineracao, Leno. Eu cuido do nosso imperio.',
    };
  }

  /**
   * Simula o agente em plantao (background / turno).
   */
  static startShift(
    logs: AgentShiftLog[] = this.DEFAULT_DAY_SHIFT,
    logToConsole = true,
  ): AgentShiftReport {
    const report = this.buildShiftReport(logs);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   AGENTE AUTONOMO GEMINI EM PLANTAO");
    console.log(`   FOCO: ${report.focus}`);
    console.log(`   SITUACAO: AGUARDANDO COMANDOS DE ${report.commander}`);
    console.log(`   CONEXAO: ${report.connection}`);
    console.log(`   DESTINO FINANCEIRO: ${report.financialDestination}`);
    console.log("-".repeat(45));

    for (const entry of report.logs) {
      console.log(`[LOG AUTOMATICO]: Formula ${entry.formulaId} -> ${entry.status}`);
      if (entry.profitBRL > 0) {
        console.log(`   Lucro registrado: R$ ${entry.profitBRL.toFixed(2)} -> ${report.financialDestination}`);
      }
    }

    console.log("\nSTATUS: Relatorio consolidado para o turno da noite.");
    console.log(`   Aprovadas: ${report.approvedCount} | Rejeitadas: ${report.rejectedCount}`);
    console.log(`   Lucro turno: R$ ${report.totalProfitBRL.toFixed(2)}`);
    console.log(`   "${report.closingMessage}"`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static startShiftFromBatch(
    balance: GlobalBatchBalance,
    logToConsole = true,
  ): AgentShiftReport {
    return this.startShift(this.logsFromBatch(balance), logToConsole);
  }

  /** Persiste relatorio de plantao (JSON) para auditoria autonoma. */
  static async persistShiftReport(
    report: AgentShiftReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-agent");
    await mkdir(dir, { recursive: true });
    const stamp = Date.now();
    const filePath = path.join(dir, `leno_shift_${stamp}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
