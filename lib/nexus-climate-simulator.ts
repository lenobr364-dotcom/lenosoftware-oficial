/**
 * NEXUS CORE — analytics preditivo de qualidade por zona climatica.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { ChemVaultNexus } from "@/lib/chemvault-nexus";
import {
  NexusEnvironmentShield,
  type GeoClimate,
} from "@/lib/nexus-environment-shield";
import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import type { FormulaData } from "@/lib/nexus-formula-data";
import { ThermalService } from "@/lib/thermal-service";

export type ClimateZone = {
  city: string;
  temp: number;
  humidity: number;
};

export type ClimateZoneResult = {
  zone: ClimateZone;
  estimatedStabilityPercent: number;
  adjustedSafetyIndex: number;
  thermalStatus: string;
  approved: boolean;
};

export type ClimateTestReport = {
  formulaId: string;
  owners: string;
  zones: ClimateZoneResult[];
  globallyResilient: boolean;
  conclusion: string;
  registry: string;
  testedAt: string;
};

export class NexusClimateSimulator {
  static readonly OWNERS = NEXUS_LEGAL.partnership;
  static readonly REGISTRY = "Laudo anexado ao ativo na BIJU";

  static readonly DEFAULT_ZONES: ClimateZone[] = [
    { city: "Cuiaba", temp: 40, humidity: 30 },
    { city: "Belo Horizonte", temp: 24, humidity: 65 },
    { city: "Europa (Portugal)", temp: 18, humidity: 55 },
  ];

  private static estimateStability(tempC: number, adjustedSafety: number): number {
    const heuristic = Math.max(0, 100 - tempC * 0.05);
    return Math.round(((heuristic + adjustedSafety) / 2) * 100) / 100;
  }

  static toGeoClimate(zone: ClimateZone): GeoClimate {
    return {
      location: zone.city,
      currentTempC: zone.temp,
      humidity: zone.humidity,
    };
  }

  static runZoneTest(
    formula: FormulaData,
    zone: ClimateZone,
  ): ClimateZoneResult {
    const thermal = ThermalService.analyze({
      ...formula,
      ambientTempC: zone.temp,
    });
    const climate = this.toGeoClimate(zone);
    const adjustedSafety = NexusEnvironmentShield.applyClimateCorrection(
      thermal,
      climate,
      false,
    );
    const estimatedStabilityPercent = this.estimateStability(zone.temp, adjustedSafety);
    const shielded = NexusEnvironmentShield.withAdjustedResult(thermal, adjustedSafety);
    const audit = ChemVaultNexus.processLicensing(shielded);

    return {
      zone,
      estimatedStabilityPercent,
      adjustedSafetyIndex: adjustedSafety,
      thermalStatus: thermal.status,
      approved: audit.isApproved,
    };
  }

  static buildClimateTest(
    formulaId: string,
    formula: FormulaData,
    zones: ClimateZone[] = this.DEFAULT_ZONES,
  ): ClimateTestReport {
    const results = zones.map((zone) => this.runZoneTest(formula, zone));
    const globallyResilient = results.every((r) => r.approved);

    return {
      formulaId,
      owners: this.OWNERS,
      zones: results,
      globallyResilient,
      conclusion: globallyResilient
        ? "Formula resiliente para distribuicao global."
        : "Formula requer revisao para uma ou mais zonas climaticas.",
      registry: this.REGISTRY,
      testedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Simula reacao da formula em ambientes climaticos especificos.
   */
  static runClimateTest(
    formulaId: string,
    formula?: FormulaData,
    logToConsole = true,
  ): ClimateTestReport {
    const data: FormulaData =
      formula ?? {
        id: formulaId,
        substance: formulaId,
        viscosity_g_cm3: 1.5,
        criticalFlashPointC: 110,
      };

    const report = this.buildClimateTest(formulaId, data);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log(`   SIMULACAO DE ESTABILIDADE TERMICA: ${formulaId}`);
    console.log(`   PROPRIETARIOS: ${report.owners}`);
    console.log("-".repeat(45));

    for (const row of report.zones) {
      const status = row.approved ? "APROVADO" : "REVISAR";
      console.log(
        `Destino: ${row.zone.city} (${row.zone.temp} C) | Estabilidade: ${row.estimatedStabilityPercent}% | NEXUS: ${row.adjustedSafetyIndex} [${status}]`,
      );
    }

    console.log(`\nCONCLUSAO: ${report.conclusion}`);
    console.log(`REGISTRO: ${report.registry}`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistClimateTest(
    report: ClimateTestReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-climate");
    await mkdir(dir, { recursive: true });
    const safeId = report.formulaId.replace(/[^a-zA-Z0-9-]/g, "_");
    const filePath = path.join(dir, `leno_climate_${safeId}_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    return filePath;
  }
}
