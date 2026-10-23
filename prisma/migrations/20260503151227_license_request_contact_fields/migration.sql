/*
  Warnings:

  - You are about to drop the column `asset` on the `LicenseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `LicenseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `LicenseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `productionCapacity` on the `LicenseRequest` table. All the data in the column will be lost.
  - Added the required column `company` to the `LicenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `corporateEmail` to the `LicenseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `LicenseRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LicenseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "corporateEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LicenseRequest" ("country", "createdAt", "id", "status") SELECT "country", "createdAt", "id", "status" FROM "LicenseRequest";
DROP TABLE "LicenseRequest";
ALTER TABLE "new_LicenseRequest" RENAME TO "LicenseRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
