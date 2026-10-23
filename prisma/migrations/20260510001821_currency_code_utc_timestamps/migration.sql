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
    "currencyCode" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Formula" ("ativo_principal", "categoria", "createdAt", "descricao", "id", "instrucoes", "licenciada", "nome") SELECT "ativo_principal", "categoria", "createdAt", "descricao", "id", "instrucoes", "licenciada", "nome" FROM "Formula";
DROP TABLE "Formula";
ALTER TABLE "new_Formula" RENAME TO "Formula";
CREATE TABLE "new_InternationalLicenseAcceptance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionCode" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "signerEmail" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_InternationalLicenseAcceptance" ("createdAt", "id", "locale", "signerEmail", "termsVersion", "transactionCode") SELECT "createdAt", "id", "locale", "signerEmail", "termsVersion", "transactionCode" FROM "InternationalLicenseAcceptance";
DROP TABLE "InternationalLicenseAcceptance";
ALTER TABLE "new_InternationalLicenseAcceptance" RENAME TO "InternationalLicenseAcceptance";
CREATE UNIQUE INDEX "InternationalLicenseAcceptance_transactionCode_key" ON "InternationalLicenseAcceptance"("transactionCode");
CREATE TABLE "new_LicenseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "corporateEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "currencyCode" TEXT NOT NULL DEFAULT 'BRL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LicenseRequest" ("company", "corporateEmail", "country", "createdAt", "id", "status") SELECT "company", "corporateEmail", "country", "createdAt", "id", "status" FROM "LicenseRequest";
DROP TABLE "LicenseRequest";
ALTER TABLE "new_LicenseRequest" RENAME TO "LicenseRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
