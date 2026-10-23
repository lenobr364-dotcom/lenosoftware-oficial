/** Tipos — Laboratório Digital Lumen Nexus */

export type LabComponentCategory = "solvent" | "surfactant" | "additive" | "catalyst" | "formula";

export type LabHazardClass = "low" | "medium" | "high";

export type LabInventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: LabComponentCategory;
  purityPct: number;
  hazardClass: LabHazardClass;
  descriptionKey: string;
};

export type WorkbenchComponent = {
  instanceId: string;
  itemId: string;
  ratioPct: number;
  temperatureC: number;
  agitationRpm: number;
  notes: string;
};

export type WorkbenchBlendSummary = {
  totalRatioPct: number;
  componentCount: number;
  dominantCategory: LabComponentCategory | null;
};
