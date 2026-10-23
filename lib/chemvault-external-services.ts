/**
 * Prestação de serviço externa — ledger separado do Laboratório Digital Gemini.
 * Não misturar com `ChemVaultRevenue` (licenciamento de fórmulas 50/50).
 */

export interface ExternalServiceJob {
  jobId: string;
  clientName: string;
  description: string;
  invoiceAmount: number;
  currency: "BRL";
}

export interface ExternalServiceLedger {
  /** Receita de consultoria / obra / Agrimat etc. */
  serviceRevenue: number;
  /** Não entra no split 50/50 do lab — regra contábil distinta. */
  channel: "EXTERNAL_SERVICE";
}

export class ChemVaultExternalServices {
  static record(job: ExternalServiceJob): ExternalServiceLedger {
    console.log("\n--- PRESTACAO DE SERVICO EXTERNA (NAO E LAB GEMINI) ---");
    console.log(`Job: ${job.jobId} · ${job.clientName}`);
    console.log(`Descricao: ${job.description}`);
    console.log(`Faturamento: R$ ${job.invoiceAmount.toFixed(2)}`);
    console.log("Este valor NAO participa do split 50/50 do laboratorio digital.");
    console.log("--------------------------------------------------\n");

    return {
      serviceRevenue: job.invoiceAmount,
      channel: "EXTERNAL_SERVICE",
    };
  }
}
