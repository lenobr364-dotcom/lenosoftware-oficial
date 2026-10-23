export type IngredientPercentage = {
  name: string;
  /**
   * Percentage of the final mixture (0..100).
   * Example: 12.5 means 12.5% of the total.
   */
  percentage: number;
};

export type IngredientWeight = {
  name: string;
  percentage: number;
  massKg: number;
  massG: number;
};

export type CalculateWeightsResult = {
  totalVolumeLiters: number;
  densityKgPerLiter: number;
  totalMassKg: number;
  ingredients: IngredientWeight[];
};

export type CalculateWeightsOptions = {
  /**
   * Assumed density of the final mixture in kg/L.
   * If you don't know it, 1.0 kg/L is a common approximation for water-like solutions.
   */
  densityKgPerLiter?: number;
  /**
   * Allowed deviation for sum of percentages (in percentage points).
   * Default: 0.0001
   */
  percentageTolerance?: number;
};

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

/**
 * Given a list of ingredients (name + percentage) and a desired final volume (L),
 * returns the exact mass of each ingredient needed.
 */
export function calculateIngredientWeights(
  ingredients: IngredientPercentage[],
  totalVolumeLiters: number,
  options: CalculateWeightsOptions = {},
): CalculateWeightsResult {
  assertFiniteNumber(totalVolumeLiters, "totalVolumeLiters");
  if (totalVolumeLiters <= 0) {
    throw new Error("totalVolumeLiters must be > 0");
  }

  const densityKgPerLiter = options.densityKgPerLiter ?? 1;
  assertFiniteNumber(densityKgPerLiter, "densityKgPerLiter");
  if (densityKgPerLiter <= 0) {
    throw new Error("densityKgPerLiter must be > 0");
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("ingredients must be a non-empty array");
  }

  const percentageTolerance = options.percentageTolerance ?? 0.0001;
  assertFiniteNumber(percentageTolerance, "percentageTolerance");
  if (percentageTolerance < 0) {
    throw new Error("percentageTolerance must be >= 0");
  }

  const normalizedIngredients = ingredients.map((ing, idx) => {
    if (!ing || typeof ing !== "object") {
      throw new Error(`ingredients[${idx}] must be an object`);
    }
    if (typeof ing.name !== "string" || ing.name.trim().length === 0) {
      throw new Error(`ingredients[${idx}].name must be a non-empty string`);
    }
    assertFiniteNumber(ing.percentage, `ingredients[${idx}].percentage`);
    if (ing.percentage < 0) {
      throw new Error(`ingredients[${idx}].percentage must be >= 0`);
    }
    if (ing.percentage > 100) {
      throw new Error(`ingredients[${idx}].percentage must be <= 100`);
    }
    return { name: ing.name.trim(), percentage: ing.percentage };
  });

  const percentageSum = normalizedIngredients.reduce(
    (acc, ing) => acc + ing.percentage,
    0,
  );

  if (Math.abs(percentageSum - 100) > percentageTolerance) {
    throw new Error(
      `Sum of ingredient percentages must be 100 (got ${percentageSum})`,
    );
  }

  const totalMassKg = totalVolumeLiters * densityKgPerLiter;

  const computed = normalizedIngredients.map<IngredientWeight>((ing) => {
    const massKg = totalMassKg * (ing.percentage / 100);
    return {
      name: ing.name,
      percentage: ing.percentage,
      massKg,
      massG: massKg * 1000,
    };
  });

  return {
    totalVolumeLiters,
    densityKgPerLiter,
    totalMassKg,
    ingredients: computed,
  };
}

export type Formula = {
  name: string;
  ingredients: IngredientPercentage[];
};

export const solupanExampleFormula: Formula = {
  name: "Solupan (exemplo para teste)",
  ingredients: [
    { name: "Água", percentage: 74.0 },
    { name: "Tensoativo não-iônico", percentage: 8.0 },
    { name: "Metassilicato de sódio", percentage: 7.0 },
    { name: "Hidróxido de sódio (soda cáustica)", percentage: 3.0 },
    { name: "Solvente (ex.: butilglicol)", percentage: 6.0 },
    { name: "Aditivos (corante/fragrância/conservante)", percentage: 2.0 },
  ],
};

