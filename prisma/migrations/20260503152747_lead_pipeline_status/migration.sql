-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LicenseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "corporateEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LicenseRequest" ("company", "corporateEmail", "country", "createdAt", "id", "status")
SELECT
    "company",
    "corporateEmail",
    "country",
    "createdAt",
    "id",
    CASE
        WHEN "status" IN ('Pending', 'PENDING') THEN 'Pendente'
        WHEN "status" IN ('ACTIVE', 'Ativa') THEN 'Aprovado'
        WHEN "status" IN ('Em Análise') THEN 'Em Análise'
        WHEN "status" IN ('REJECTED', 'Rejeitado') THEN 'REJECTED'
        ELSE "status"
    END
FROM "LicenseRequest";
DROP TABLE "LicenseRequest";
ALTER TABLE "new_LicenseRequest" RENAME TO "LicenseRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
