-- CreateTable
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "productLine" TEXT NOT NULL,
    "rawMaterials" TEXT NOT NULL,
    "preparationMethod" TEXT NOT NULL,
    "dilutionDetails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
