/**
 * NEXUS CORE — estoque inteligente e rastreio de materia-prima.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";

export type InventoryItem = {
  item: string;
  level: number;
  sku?: string;
};

export type InventoryLineStatus = {
  item: InventoryItem;
  status: "ESTAVEL" | "REPOSICAO_NECESSARIA";
  action?: string;
};

export type InventoryAuditReport = {
  partners: string;
  thresholdPercent: number;
  lines: InventoryLineStatus[];
  lowStockCount: number;
  purchaseOrdersSuggested: string[];
  status: string;
  directive: string;
  auditedAt: string;
};

export class NexusInventoryManager {
  static readonly REAGENTS_THRESHOLD = 20;
  static readonly PARTNERS = NEXUS_LEGAL.partnership;
  static readonly PURCHASE_HUB = "BIJU";

  static readonly DEFAULT_INVENTORY: InventoryItem[] = [
    { item: "Base Polimerica V6", level: 85, sku: "RAW-V6-BASE" },
    { item: "Catalisador de Estabilidade", level: 15, sku: "RAW-CAT-STAB" },
    { item: "Solvente de Pureza Nexus", level: 60, sku: "RAW-SOL-NX" },
  ];

  static evaluateItem(item: InventoryItem): InventoryLineStatus {
    const low = item.level <= this.REAGENTS_THRESHOLD;
    return {
      item,
      status: low ? "REPOSICAO_NECESSARIA" : "ESTAVEL",
      action: low
        ? `Notificar ${this.PURCHASE_HUB} para emissao de ordem de compra.`
        : undefined,
    };
  }

  static buildAudit(inventory: InventoryItem[] = this.DEFAULT_INVENTORY): InventoryAuditReport {
    const lines = inventory.map((item) => this.evaluateItem(item));
    const lowStock = lines.filter((l) => l.status === "REPOSICAO_NECESSARIA");

    return {
      partners: this.PARTNERS,
      thresholdPercent: this.REAGENTS_THRESHOLD,
      lines,
      lowStockCount: lowStock.length,
      purchaseOrdersSuggested: lowStock.map((l) => l.item.sku ?? l.item.item),
      status: "Monitoramento de insumos concluido",
      directive: "Manter o laboratorio sempre abastecido para licenciamento imediato.",
      auditedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Verifica niveis de insumos do laboratorio ChemVault.
   */
  static checkStockLevels(
    inventory: InventoryItem[] = this.DEFAULT_INVENTORY,
    logToConsole = true,
  ): InventoryAuditReport {
    const report = this.buildAudit(inventory);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   CONTROLE DE ESTOQUE: CHEMVAULT GLOBAL");
    console.log(`   SOCIOS: ${report.partners}`);
    console.log(`   LIMITE DE ALERTA: ${report.thresholdPercent}%`);
    console.log("-".repeat(45));

    for (const line of report.lines) {
      const label =
        line.status === "REPOSICAO_NECESSARIA" ? "REPOSICAO NECESSARIA" : "ESTAVEL";
      console.log(
        `${line.item.item.padEnd(28)} | Nivel: ${line.item.level}% | Status: ${label}`,
      );
      if (line.action) {
        console.log(`   ACAO: ${line.action}`);
      }
    }

    console.log(`\nSTATUS: ${report.status}.`);
    console.log(`DIRETRIZ: ${report.directive}`);
    if (report.lowStockCount > 0) {
      console.log(`Itens criticos: ${report.purchaseOrdersSuggested.join(", ")}`);
    }
    console.log("-".repeat(45) + "\n");

    return report;
  }

  /** Ajusta consumo simulado apos lote processado (reduz base/catalisador). */
  static applyBatchConsumption(
    inventory: InventoryItem[],
    formulasProcessed: number,
  ): InventoryItem[] {
    return inventory.map((row) => {
      if (row.sku === "RAW-CAT-STAB") {
        return { ...row, level: Math.max(0, row.level - formulasProcessed * 3) };
      }
      if (row.sku === "RAW-V6-BASE") {
        return { ...row, level: Math.max(0, row.level - formulasProcessed * 2) };
      }
      return row;
    });
  }

  static async persistAudit(
    report: InventoryAuditReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-inventory");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_inventory_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
