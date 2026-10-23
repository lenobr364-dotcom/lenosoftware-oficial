/**
 * NEXUS CORE — renderizador visual da bancada digital (UI/UX + console).
 */

import { NEXUS_LEGAL } from "@/lib/nexus-legal-identity";
import { NexusVisualEngine } from "@/lib/nexus-visual-engine";

export type LabEquipmentItem = {
  id: string;
  label: string;
  detail: string;
  active: boolean;
};

export type LaboratoryViewMeta = {
  systemName: string;
  environment: string;
  style: string;
  version: string;
  designer: string;
  engineer: string;
  glassClass: string;
  equipment: LabEquipmentItem[];
};

export class NexusVisualRenderer {
  static readonly SYSTEM_NAME = "SISTEMA DE VISUALIZACAO GEMINI";
  static readonly ENVIRONMENT = "LABORATORIO QUIMICO DIGITAL V6";
  static readonly STYLE = "GLASSMORPHISM INTERNACIONAL";
  static readonly DESIGNER = NEXUS_LEGAL.fullName;
  static readonly ENGINEER = NEXUS_LEGAL.partnerLumen;

  static readonly EQUIPMENT: LabEquipmentItem[] = [
    {
      id: "digital-flask",
      label: "Proveta Digital",
      detail: "Calibrada (Fator Cuiaba)",
      active: true,
    },
    {
      id: "thermal-sensors",
      label: "Sensores Termicos",
      detail: "Ativos",
      active: true,
    },
    {
      id: "sicredi-vault",
      label: "Banco de Dados Sicredi/BIJU",
      detail: "Conectado",
      active: true,
    },
  ];

  static getLaboratoryMeta(): LaboratoryViewMeta {
    return {
      systemName: this.SYSTEM_NAME,
      environment: this.ENVIRONMENT,
      style: this.STYLE,
      version: "V6",
      designer: this.DESIGNER,
      engineer: this.ENGINEER,
      glassClass: NexusVisualEngine.GLASS_PANEL_CLASS,
      equipment: this.EQUIPMENT,
    };
  }

  /**
   * Simula a renderizacao da bancada digital em 3D / glassmorphism (console).
   */
  static renderLaboratoryView(logToConsole = true): LaboratoryViewMeta {
    const meta = this.getLaboratoryMeta();

    if (!logToConsole) return meta;

    console.log("\n" + "·".repeat(60));
    console.log(`   ${meta.systemName} - ATIVADO`);
    console.log(`   AMBIENTE: ${meta.environment}`);
    console.log(`   ESTILO: ${meta.style}`);
    console.log(`   DESIGNER: ${meta.designer} | ENGENHEIRO: ${meta.engineer}`);
    console.log("=".repeat(60));

    console.log("\n[STATUS DOS EQUIPAMENTOS]");
    for (const item of meta.equipment) {
      const mark = item.active ? "[OK]" : "[--]";
      console.log(`${mark} ${item.label}: ${item.detail}`);
    }

    console.log("\n[RENDERIZANDO INTERIOR DO LAB...]");
    console.log(">> Aguarde a geracao da imagem de alta performance...");
    console.log(`>> Glass: ${NexusVisualEngine.THEME.backdropFilter}`);
    console.log("=".repeat(60) + "\n");

    return meta;
  }
}
