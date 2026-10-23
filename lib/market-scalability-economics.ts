import { FORMULAS } from "@/lib/formulas";
import type { ProductLine } from "@/lib/product-line";

/** Indicative EUR→BRL for ChemVault internal economics (same order of magnitude as profitability calc). */
export const EUR_TO_BRL = 6;

export type ScalabilityEconomics = {
  costPerLiterBrl: number;
  suggestedPricePerLiterBrl: number;
  referenceBatchLiters: number;
};

function matchStaticFormula(title: string): { costPerLiter: number; suggestedSalePrice: number } | null {
  const t = title.trim().toLowerCase();
  for (const row of FORMULAS) {
    const n = row.name.toLowerCase();
    if (t.includes(n) || n.includes(t.slice(0, Math.min(6, t.length)))) {
      return { costPerLiter: row.costPerLiter, suggestedSalePrice: row.suggestedSalePrice };
    }
  }
  return null;
}

function defaultsForLine(line: ProductLine): { costPerLiter: number; suggestedSalePrice: number } {
  switch (line) {
    case "AUTOMOTIVE":
      return { costPerLiter: 5.2, suggestedSalePrice: 9.4 };
    case "BAR_SOAP":
      return { costPerLiter: 1.4, suggestedSalePrice: 2.6 };
    case "GENERAL_CLEANING":
      return { costPerLiter: 2.1, suggestedSalePrice: 4.1 };
    default:
      return { costPerLiter: 2.5, suggestedSalePrice: 4.5 };
  }
}

export function economicsForFormulaTitle(title: string, productLine: ProductLine): ScalabilityEconomics {
  const hit = matchStaticFormula(title) ?? defaultsForLine(productLine);
  return {
    costPerLiterBrl: hit.costPerLiter * EUR_TO_BRL,
    suggestedPricePerLiterBrl: hit.suggestedSalePrice * EUR_TO_BRL,
    referenceBatchLiters: 1000,
  };
}

/** Liters/month per formula line used for executive “simulator-style” pipeline projection. */
export const EXEC_REFERENCE_MONTHLY_LITERS = 10_000;

export function sumProjectedMonthlyRevenueBrl(
  rows: { title: string; productLine: ProductLine }[],
  litersPerFormula = EXEC_REFERENCE_MONTHLY_LITERS,
): number {
  return rows.reduce((sum, row) => {
    const e = economicsForFormulaTitle(row.title, row.productLine);
    return sum + e.suggestedPricePerLiterBrl * litersPerFormula;
  }, 0);
}
