/*
  Warnings:

  - You are about to alter the column `licenciada` on the `Formula` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- CreateTable
CREATE TABLE "InternationalLicenseAcceptance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionCode" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "signerEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Formula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo_principal" TEXT,
    "instrucoes" TEXT NOT NULL,
    "licenciada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Formula" ("ativo_principal", "categoria", "createdAt", "descricao", "id", "instrucoes", "licenciada", "nome") SELECT "ativo_principal", "categoria", "createdAt", "descricao", "id", "instrucoes", "licenciada", "nome" FROM "Formula";
DROP TABLE "Formula";
ALTER TABLE "new_Formula" RENAME TO "Formula";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InternationalLicenseAcceptance_transactionCode_key" ON "InternationalLicenseAcceptance"("transactionCode");
