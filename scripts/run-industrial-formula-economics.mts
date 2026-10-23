import { getIndustrialFormulaByCode } from "@/lib/industrial-formula-persistence";
import { SOLUPAN_INDUSTRIAL_FORMULA } from "@/lib/industrial-formula-seed-data";
import { calculateIndustrialFormulaEconomics } from "@/lib/production-cost";

const FORMULA_CODE = "CHM-IND-001";

const loaded = await getIndustrialFormulaByCode(FORMULA_CODE);
const formula = loaded ?? {
  id_formula: SOLUPAN_INDUSTRIAL_FORMULA.id_formula,
  nome_comercial: SOLUPAN_INDUSTRIAL_FORMULA.nome_comercial,
  ingredientes: SOLUPAN_INDUSTRIAL_FORMULA.ingredientes,
  margem_lucro_estimada_percentual: SOLUPAN_INDUSTRIAL_FORMULA.margem_lucro_estimada_percentual,
};

const economics = calculateIndustrialFormulaEconomics(formula, { densityKgPerLiter: 1.05 });

console.log("=== ChemVault Industrial Formula Economics ===");
console.log(`Source: ${loaded ? "database" : "seed fallback"}`);
console.log(`Formula: ${formula.id_formula} — ${formula.nome_comercial}`);
console.log(`Target margin (markup on cost): ${economics.margem_lucro_estimada_percentual}%`);
console.log(`Assumed density: ${economics.density_kg_per_liter} kg/L`);
console.log("");
console.log("Ingredient cost breakdown (USD/kg of finished product):");
for (const line of economics.ingredient_lines) {
  console.log(
    `  • ${line.nome_tecnico}: ${line.concentracao_percentual}% × $${line.custo_por_kg_dolar}/kg → $${line.cost_contribution_usd_per_kg}/kg`,
  );
}
console.log("");
console.log(`Base production cost: $${economics.base_cost_usd_per_kg}/kg | $${economics.base_cost_usd_per_liter}/L`);
console.log(
  `Suggested licensing/selling price: $${economics.suggested_licensing_price_usd_per_kg}/kg | $${economics.suggested_licensing_price_usd_per_liter}/L`,
);
console.log(`Profit per kg: $${economics.profit_usd_per_kg}`);
console.log(`Margin on selling price: ${economics.margin_on_price_percent}%`);
