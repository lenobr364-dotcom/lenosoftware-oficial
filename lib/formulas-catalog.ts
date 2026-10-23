import { type FormulaRecord, FORMULAS, type LicenseStatus } from "./formulas";

export type { LicenseStatus };

export type FormulaCatalogRow = Pick<
  FormulaRecord,
  "id" | "name" | "code" | "license" | "lastUpdated"
>;

export const FORMULAS_CATALOG: FormulaCatalogRow[] = FORMULAS.map(
  ({ id, name, code, license, lastUpdated }) => ({ id, name, code, license, lastUpdated }),
);

export type FormulaTechnicalDetail = {
  composition: string;
  mixingInstructions: string;
  safetyPrecautions: string;
};

export function getFormulaCatalogRow(id: string): FormulaCatalogRow | undefined {
  return FORMULAS_CATALOG.find((f) => f.id === id);
}

export function getFormulaTechnicalDetail(row: FormulaCatalogRow): FormulaTechnicalDetail {
  const full = FORMULAS.find((f) => f.id === row.id);
  if (!full) {
    return {
      composition: "",
      mixingInstructions: "",
      safetyPrecautions: "",
    };
  }
  return {
    composition: full.composition,
    mixingInstructions: full.mixingInstructions,
    safetyPrecautions: full.safetyPrecautions,
  };
}
