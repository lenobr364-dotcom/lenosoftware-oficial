import { FORMULAS } from "@/lib/formulas";
import type { LabInventoryItem } from "@/lib/digital-laboratory/types";

const BASE_REAGENTS: LabInventoryItem[] = [
  {
    id: "rg-water",
    sku: "NX-H2O-001",
    name: "Deionized water",
    category: "solvent",
    purityPct: 99.9,
    hazardClass: "low",
    descriptionKey: "descWater",
  },
  {
    id: "rg-naoh",
    sku: "NX-NAOH-010",
    name: "NaOH 10% w/w",
    category: "catalyst",
    purityPct: 10,
    hazardClass: "high",
    descriptionKey: "descNaoh",
  },
  {
    id: "rg-citric",
    sku: "NX-CIT-050",
    name: "Citric acid",
    category: "additive",
    purityPct: 99.5,
    hazardClass: "medium",
    descriptionKey: "descCitric",
  },
  {
    id: "rg-fragrance",
    sku: "NX-FRG-002",
    name: "Industrial fragrance base",
    category: "additive",
    purityPct: 100,
    hazardClass: "low",
    descriptionKey: "descFragrance",
  },
];

function formulasAsInventory(): LabInventoryItem[] {
  return FORMULAS.map((f) => ({
    id: `fm-${f.id}`,
    sku: f.code,
    name: f.name,
    category: "formula" as const,
    purityPct: 100,
    hazardClass: "medium" as const,
    descriptionKey: "descLicensedFormula",
  }));
}

export function getDigitalLabInventory(): LabInventoryItem[] {
  return [...BASE_REAGENTS, ...formulasAsInventory()];
}

export function findInventoryItem(id: string): LabInventoryItem | undefined {
  return getDigitalLabInventory().find((i) => i.id === id);
}
