-- ChemVault: fórmulas industriais estruturadas (BOM tipado) e ingredientes.
CREATE TABLE "IndustrialFormula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idFormula" TEXT NOT NULL,
    "nomeComercial" TEXT NOT NULL,
    "aplicacao" TEXT NOT NULL,
    "phIdeal" REAL NOT NULL,
    "margemLucroEstimadaPercentual" REAL NOT NULL,
    "instrucoesSeguranca" TEXT NOT NULL,
    "licenciada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "IndustrialFormula_idFormula_key" ON "IndustrialFormula"("idFormula");
CREATE INDEX "IndustrialFormula_licenciada_nomeComercial_idx" ON "IndustrialFormula"("licenciada", "nomeComercial");

CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "industrialFormulaId" TEXT NOT NULL,
    "nomeTecnico" TEXT NOT NULL,
    "concentracaoPercentual" REAL NOT NULL,
    "custoPorKgDolar" REAL NOT NULL,
    "funcaoQuimica" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Ingredient_industrialFormulaId_fkey" FOREIGN KEY ("industrialFormulaId") REFERENCES "IndustrialFormula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Ingredient_industrialFormulaId_idx" ON "Ingredient"("industrialFormulaId");
