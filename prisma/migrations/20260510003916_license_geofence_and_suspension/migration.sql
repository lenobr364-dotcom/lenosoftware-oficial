-- CreateTable
CREATE TABLE "LicenseGeoPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "allowedRegionCodes" TEXT NOT NULL,
    "anomalyWindowMinutes" INTEGER NOT NULL DEFAULT 15,
    "massOffRegionThreshold" INTEGER NOT NULL DEFAULT 6,
    "suspendMinutes" INTEGER NOT NULL DEFAULT 45,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LicenseSuspension" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "until" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseGeoPolicy_subject_key" ON "LicenseGeoPolicy"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseSuspension_subject_key" ON "LicenseSuspension"("subject");
