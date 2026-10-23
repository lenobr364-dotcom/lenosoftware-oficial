import type { ProductLine } from "@/lib/product-line";

export type FormulaGlassCardData = {
  id: string;
  title: string;
  productLine: ProductLine;
  rawMaterials: string;
  preparationMethod: string;
  dilutionDetails: string;
  chemicalEquivalence: string;
  technicalDossier?: string;
  hardwareIntegrationProfile?: string;
  licensingTags?: string;
  stewardAuthor?: string;
};
