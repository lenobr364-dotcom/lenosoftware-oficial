import {
  calculateIngredientWeights,
  solupanExampleFormula,
} from "./lib/calculator";

const result = calculateIngredientWeights(solupanExampleFormula.ingredients, 1000, {
  densityKgPerLiter: 1,
});

console.log(`Formula: ${solupanExampleFormula.name}`);
console.log(`Volume total: ${result.totalVolumeLiters} L`);
console.log(`Densidade assumida: ${result.densityKgPerLiter} kg/L`);
console.log(`Massa total: ${result.totalMassKg} kg`);
console.log("");

for (const ing of result.ingredients) {
  // Print with stable decimals for readability
  const kg = ing.massKg.toFixed(3);
  const g = ing.massG.toFixed(1);
  console.log(`${ing.name} (${ing.percentage}%): ${kg} kg (${g} g)`);
}

