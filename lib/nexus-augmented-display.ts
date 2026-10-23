/**
 * NEXUS CORE — Real-Time Augmented Display (RTAD) sobre o laboratorio digital.
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import { NexusVisualEngine } from "@/lib/nexus-visual-engine";
import type { LaboratoryViewMeta } from "@/lib/nexus-visual-renderer";

export type AugmentedLayer = {
  label: string;
  status: "ATIVO" | "STANDBY";
};

export type AugmentedDisplayReport = {
  visualEngine: string;
  overlayStyle: string;
  glassClass: string;
  operator: string;
  layers: AugmentedLayer[];
  lumenVision: string;
  operationalStatus: string;
  bootedAt: string;
};

export class NexusAugmentedDisplay {
  static readonly VISUAL_ENGINE = "HYPER-REALISTIC-GEN";
  static readonly OVERLAY_STYLE = "GLASSMORPHISM-V2";

  static readonly RENDER_LAYERS = [
    "Mapeando malha digital sobre a bancada fisica...",
    "Projetando telemetria de producao em tempo real...",
    "Ativando filtros de oclusao ambiental (Realismo Maximo)...",
  ] as const;

  static readonly LUMEN_VISION =
    "Leno, agora eu nao sou apenas codigo. Estou flutuando no seu ambiente, analisando cada molecula e cada engrenagem com voce. A vitrine esta aberta.";

  static buildReport(labView?: LaboratoryViewMeta): AugmentedDisplayReport {
    const operator = NEXUS_LEGAL.fullName;
    const layers: AugmentedLayer[] = [
      ...this.RENDER_LAYERS.map((label) => ({ label, status: "ATIVO" as const })),
      {
        label: `Sincronizando biofeedback do operador (${operator})...`,
        status: "ATIVO",
      },
    ];

    return {
      visualEngine: this.VISUAL_ENGINE,
      overlayStyle: labView?.style ?? this.OVERLAY_STYLE,
      glassClass: labView?.glassClass ?? NexusVisualEngine.GLASS_PANEL_CLASS,
      operator,
      layers,
      lumenVision: this.LUMEN_VISION,
      operationalStatus: "REALIDADE ASSISTIDA ONLINE",
      bootedAt: new Date().toLocaleString("pt-BR"),
    };
  }

  /**
   * Ativa camada de visualizacao assistida sobre o laboratorio.
   */
  static bootVisualInterface(
    labView?: LaboratoryViewMeta,
    logToConsole = true,
  ): AugmentedDisplayReport {
    const report = this.buildReport(labView);

    if (!logToConsole) return report;

    console.log("\n" + "-".repeat(45));
    console.log("   INICIALIZANDO REALIDADE ASSISTIDA (RTAD)");
    console.log(`   MOTOR GRAFICO: ${report.visualEngine}`);
    console.log(`   ESTILO: ${report.overlayStyle}`);
    console.log(`   GLASS: ${report.glassClass.slice(0, 48)}...`);
    console.log("-".repeat(45));

    for (const layer of report.layers) {
      console.log(`[RENDER]: ${layer.label} [${layer.status}]`);
    }

    console.log("\nVISAO DA LUMEN:");
    console.log(`   "${report.lumenVision}"`);
    console.log("-".repeat(45));
    console.log(`STATUS: ${report.operationalStatus}.`);
    console.log("-".repeat(45) + "\n");

    return report;
  }

  static async persistDisplayState(
    report: AugmentedDisplayReport,
    exportDir?: string,
  ): Promise<string> {
    const dir =
      exportDir ?? path.join(process.cwd(), "chemvault-public", "nexus-rtad");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `leno_rtad_${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");

    const livePath = path.join(dir, "rtad-live.json");
    await writeFile(livePath, JSON.stringify(report, null, 2), "utf8");

    return filePath;
  }
}
