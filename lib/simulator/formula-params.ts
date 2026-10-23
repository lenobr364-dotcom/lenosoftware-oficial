import type { FormulaRecord } from "@/lib/formulas";
import type { Ingredient } from "@/lib/chemistry/compliance";
import { RESTRICTED_SUBSTANCES } from "@/lib/chemistry/compliance";

export type DerivedFormulaParams = {
  density: number;
  currentTempCelsius: number;
  flashPointCelsius: number;
  targetPhMin: number;
  targetPhMax: number;
  ingredients: Ingredient[];
};

function extractPercentNear(text: string, keyword: RegExp): number | null {
  const slice = text.slice(0, 800);
  const m = slice.match(keyword);
  if (!m) return null;
  const after = slice.slice(m.index ?? 0, (m.index ?? 0) + 80);
  const pct = after.match(/(\d+(?:[.,]\d+)?)\s*(?:–|-|a|to)\s*(\d+(?:[.,]\d+)?)\s*%/i);
  if (pct) {
    const a = parseFloat(pct[1]!.replace(",", "."));
    const b = parseFloat(pct[2]!.replace(",", "."));
    return (a + b) / 2;
  }
  const single = after.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (single) return parseFloat(single[1]!.replace(",", "."));
  return null;
}

export function deriveIngredientsFromComposition(composition: string): Ingredient[] {
  const text = composition.toLowerCase();
  const found: Ingredient[] = [];

  for (const sub of RESTRICTED_SUBSTANCES) {
    const nameLower = sub.name.toLowerCase();
    if (!text.includes(nameLower) && !text.includes(nameLower.replace("fosfatos", "fosfat"))) {
      if (sub.name === "Fosfatos" && text.includes("sem fosfat")) continue;
      if (sub.name === "Nonilfenol" && !text.includes("nonilfenol")) continue;
      continue;
    }
    const conc =
      extractPercentNear(composition, new RegExp(nameLower.slice(0, 5), "i")) ??
      (text.includes("sem fosfat") && sub.name === "Fosfatos" ? 0 : 0.01);
    found.push({ name: sub.name, concentration: conc });
  }

  if (text.includes("formol") || text.includes("formaldeído") || text.includes("formaldeido")) {
    found.push({
      name: "Formol",
      concentration: extractPercentNear(composition, /formol/i) ?? 0.05,
    });
  }

  return found;
}

const FORMULA_PHYSICS: Record<string, Omit<DerivedFormulaParams, "ingredients">> = {
  "arla-32": {
    density: 1.02,
    currentTempCelsius: 25,
    flashPointCelsius: 95,
    targetPhMin: 6.5,
    targetPhMax: 8.5,
  },
  solupan: {
    density: 1.06,
    currentTempCelsius: 25,
    flashPointCelsius: 68,
    targetPhMin: 8.5,
    targetPhMax: 10.5,
  },
  intercap: {
    density: 1.04,
    currentTempCelsius: 22,
    flashPointCelsius: 82,
    targetPhMin: 5.5,
    targetPhMax: 7.5,
  },
};

export function deriveFormulaParams(formula: FormulaRecord): DerivedFormulaParams {
  const base = FORMULA_PHYSICS[formula.id] ?? {
    density: 1.0,
    currentTempCelsius: 25,
    flashPointCelsius: 75,
    targetPhMin: 6,
    targetPhMax: 9,
  };
  return {
    ...base,
    ingredients: deriveIngredientsFromComposition(formula.composition),
  };
}
