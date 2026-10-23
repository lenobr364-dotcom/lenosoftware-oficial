import type { IngredienteBody } from "@/lib/validation/industrial-formula-schemas";

export interface RawMaterial {
  name: string;
  /** Preço por kg ou L (mesma unidade que `amountUsed`). */
  pricePerUnit: number;
  /** Quantidade utilizada na fórmula (kg ou L). */
  amountUsed: number;
}

export interface ProductionCostResult {
  /** Custo direto de MP (formato decimal com 2 casas). */
  directCost: string;
  /** Custo direto + overhead operacional (formato decimal com 2 casas). */
  totalCost: string;
  /** Sugestão de venda ≈ 3× custo total (margem indicativa). */
  suggestedPrice: string;
}

export type IndustrialFormulaCostInput = {
  id_formula?: string;
  nome_comercial?: string;
  ingredientes: Pick<
    IngredienteBody,
    "nome_tecnico" | "concentracao_percentual" | "custo_por_kg_dolar"
  >[];
  margem_lucro_estimada_percentual: number;
};

export type IngredientCostLine = {
  nome_tecnico: string;
  concentracao_percentual: number;
  custo_por_kg_dolar: number;
  /** Parcela do custo base (USD/kg de produto acabado). */
  cost_contribution_usd_per_kg: number;
};

export type IndustrialFormulaEconomics = {
  id_formula?: string;
  nome_comercial?: string;
  /** Soma ponderada dos ingredientes (USD/kg de produto acabado). */
  base_cost_usd_per_kg: number;
  /** Custo base por litro (USD/L), usando densidade assumida. */
  base_cost_usd_per_liter: number;
  density_kg_per_liter: number;
  margem_lucro_estimada_percentual: number;
  /** Preço sugerido de licenciamento/venda (USD/kg) com markup sobre o custo. */
  suggested_licensing_price_usd_per_kg: number;
  suggested_licensing_price_usd_per_liter: number;
  profit_usd_per_kg: number;
  /** Margem real sobre o preço de venda ((preço − custo) / preço). */
  margin_on_price_percent: number;
  ingredient_lines: IngredientCostLine[];
};

function roundMoney(value: number, decimals = 6): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * @param overhead Fração de custos indirectos sobre o custo directo (default 0.15 = 15%).
 */
export function calculateProductionCost(
  materials: RawMaterial[],
  overhead = 0.15,
): ProductionCostResult {
  const directCost = materials.reduce((acc, mat) => acc + mat.pricePerUnit * mat.amountUsed, 0);

  const totalCost = directCost * (1 + overhead);

  return {
    directCost: directCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    suggestedPrice: (totalCost * 3).toFixed(2),
  };
}

/**
 * Custo base por kg de produto acabado a partir da BOM tipada.
 * Cada ingrediente contribui: custo_por_kg_dolar × (concentracao_percentual / 100).
 */
export function calculateIndustrialFormulaBaseCostPerKg(
  ingredientes: IndustrialFormulaCostInput["ingredientes"],
): { baseCostUsdPerKg: number; ingredientLines: IngredientCostLine[] } {
  const ingredientLines = ingredientes.map((ing) => {
    const fraction = ing.concentracao_percentual / 100;
    const costContributionUsdPerKg = ing.custo_por_kg_dolar * fraction;
    return {
      nome_tecnico: ing.nome_tecnico,
      concentracao_percentual: ing.concentracao_percentual,
      custo_por_kg_dolar: ing.custo_por_kg_dolar,
      cost_contribution_usd_per_kg: costContributionUsdPerKg,
    };
  });

  const baseCostUsdPerKg = ingredientLines.reduce(
    (sum, line) => sum + line.cost_contribution_usd_per_kg,
    0,
  );

  return { baseCostUsdPerKg, ingredientLines };
}

/**
 * Preço sugerido com markup sobre o custo: preço = custo × (1 + margem%/100).
 * Ex.: margem 350 → preço = custo × 4,5.
 */
export function calculateIndustrialFormulaSuggestedPrice(
  baseCostUsdPerKg: number,
  margemLucroEstimadaPercentual: number,
): {
  suggestedPriceUsdPerKg: number;
  profitUsdPerKg: number;
  marginOnPricePercent: number;
} {
  const multiplier = 1 + margemLucroEstimadaPercentual / 100;
  const suggestedPriceUsdPerKg = baseCostUsdPerKg * multiplier;
  const profitUsdPerKg = suggestedPriceUsdPerKg - baseCostUsdPerKg;
  const marginOnPricePercent =
    suggestedPriceUsdPerKg > 0 ? (profitUsdPerKg / suggestedPriceUsdPerKg) * 100 : 0;

  return { suggestedPriceUsdPerKg, profitUsdPerKg, marginOnPricePercent };
}

export type IndustrialFormulaEconomicsOptions = {
  /** Densidade média do produto acabado (kg/L). Default 1,0 para bases aquosas. */
  densityKgPerLiter?: number;
};

/** Motor completo de custo + preço sugerido para `IndustrialFormula`. */
export function calculateIndustrialFormulaEconomics(
  formula: IndustrialFormulaCostInput,
  options: IndustrialFormulaEconomicsOptions = {},
): IndustrialFormulaEconomics {
  const densityKgPerLiter = options.densityKgPerLiter ?? 1;
  const { baseCostUsdPerKg, ingredientLines } = calculateIndustrialFormulaBaseCostPerKg(
    formula.ingredientes,
  );
  const { suggestedPriceUsdPerKg, profitUsdPerKg, marginOnPricePercent } =
    calculateIndustrialFormulaSuggestedPrice(
      baseCostUsdPerKg,
      formula.margem_lucro_estimada_percentual,
    );

  return {
    id_formula: formula.id_formula,
    nome_comercial: formula.nome_comercial,
    base_cost_usd_per_kg: roundMoney(baseCostUsdPerKg),
    base_cost_usd_per_liter: roundMoney(baseCostUsdPerKg * densityKgPerLiter),
    density_kg_per_liter: densityKgPerLiter,
    margem_lucro_estimada_percentual: formula.margem_lucro_estimada_percentual,
    suggested_licensing_price_usd_per_kg: roundMoney(suggestedPriceUsdPerKg),
    suggested_licensing_price_usd_per_liter: roundMoney(suggestedPriceUsdPerKg * densityKgPerLiter),
    profit_usd_per_kg: roundMoney(profitUsdPerKg),
    margin_on_price_percent: roundMoney(marginOnPricePercent),
    ingredient_lines: ingredientLines.map((line) => ({
      ...line,
      cost_contribution_usd_per_kg: roundMoney(line.cost_contribution_usd_per_kg),
    })),
  };
}