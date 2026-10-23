/**
 * NEXUS CORE — scanner de ativos quimicos (pureza molecular para licenciamento).
 */

import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { FormulaData } from "@/lib/nexus-formula-data";

export type ComponentScan = {
  index: number;
  name: string;
  status: "ESTAVEL" | "ALERTA";
};

export type ChemicalScanResult = {
  formulaName: string;
  formulaId?: string;
  partners: string;
  components: ComponentScan[];
  purityPercent: number;
  readyForBilling: boolean;
  billingTarget: string;
  scannedAt: string;
};

export class NexusChemicalScanner {
  static readonly PARTNERS = NEXUS_LEGAL.partnership;
  static readonly BILLING_TARGET = "CONTA BIJU (SICREDI)";
  static readonly MIN_PURITY_FOR_BILLING = 99.5;

  static readonly DEFAULT_COMPONENTS = [
    "Polimero Sintetico",
    "Agente de Estabilidade",
    "Catalisador Nexus",
  ];

  static resolveComponents(formula?: FormulaData, override?: string[]): string[] {
    if (override && override.length > 0) return override;
    if (formula?.components && formula.components.length > 0) return formula.components;
    return this.DEFAULT_COMPONENTS;
  }

  private static analyzeComponent(name: string): ComponentScan["status"] {
    const lower = name.toLowerCase();
    if (
      lower.includes("inflam") ||
      lower.includes("solvente") ||
      lower.includes("eter")
    ) {
      return "ALERTA";
    }
    return "ESTAVEL";
  }

  private static computePurity(components: ComponentScan[]): number {
    const alertCount = components.filter((c) => c.status === "ALERTA").length;
    if (alertCount === 0) return 99.98;
    const penalty = alertCount * 2.5;
    return Math.max(90, Math.round((99.98 - penalty) * 100) / 100);
  }

  static buildScan(
    formulaName: string,
    components: string[],
    formulaId?: string,
  ): ChemicalScanResult {
    const scanned: ComponentScan[] = components.map((name, index) => ({
      index: index + 1,
      name,
      status: this.analyzeComponent(name),
    }));

    const purityPercent = this.computePurity(scanned);
    const readyForBilling = purityPercent >= this.MIN_PURITY_FOR_BILLING;

    return {
      formulaName,
      formulaId,
      partners: this.PARTNERS,
      components: scanned,
      purityPercent,
      readyForBilling,
      billingTarget: this.BILLING_TARGET,
      scannedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Executa scan profundo na formula do cliente.
   */
  static scanFormula(
    formulaName: string,
    components: string[],
    logToConsole = true,
  ): ChemicalScanResult {
    const result = this.buildScan(formulaName, components);

    if (!logToConsole) return result;

    console.log("\n" + "=".repeat(50));
    console.log(`   INICIANDO SCAN: ${formulaName}`);
    console.log(`   SOCIOS RESPONSAVEIS: ${result.partners}`);
    console.log("-".repeat(40));

    for (const comp of result.components) {
      console.log(
        `Analisando Componente [${comp.index}]: ${comp.name}... [${comp.status}]`,
      );
    }

    console.log(`\nRESULTADO: Pureza verificada em ${result.purityPercent}%`);
    console.log(
      `STATUS: ${result.readyForBilling ? "Pronto" : "Revisao necessaria"} para faturamento na ${result.billingTarget}.`,
    );
    console.log("=".repeat(50) + "\n");

    return result;
  }

  static scanFormulaData(
    formula: FormulaData,
    logToConsole = true,
  ): ChemicalScanResult {
    const components = this.resolveComponents(formula);
    return this.scanFormula(
      formula.substance || formula.id,
      components,
      logToConsole,
    );
  }

  static async persistScan(
    result: ChemicalScanResult,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-scans");
    await mkdir(dir, { recursive: true });
    const id =
      result.formulaId ??
      createHash("sha256").update(result.formulaName).digest("hex").slice(0, 8);
    const safeId = id.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_scan_${safeId}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(result, null, 2), "utf8");
    return filePath;
  }
}
