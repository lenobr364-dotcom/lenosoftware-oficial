/*
  Warnings:

  - You are about to drop the column `name` on the `LicenseRequest` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LicenseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "corporateEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LicenseRequest" ("company", "corporateEmail", "country", "createdAt", "id", "status") SELECT "company", "corporateEmail", "country", "createdAt", "id", "status" FROM "LicenseRequest";
DROP TABLE "LicenseRequest";
ALTER TABLE "new_LicenseRequest" RENAME TO "LicenseRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
