-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "requestPath" TEXT,
    "requestId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LicenseActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'unknown',
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FormulaUsageDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formulaKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "SecurityEvent_createdAt_idx" ON "SecurityEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_createdAt_idx" ON "SecurityEvent"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "LicenseActivity_createdAt_idx" ON "LicenseActivity"("createdAt");

-- CreateIndex
CREATE INDEX "LicenseActivity_region_createdAt_idx" ON "LicenseActivity"("region", "createdAt");

-- CreateIndex
CREATE INDEX "FormulaUsageDaily_day_idx" ON "FormulaUsageDaily"("day");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaUsageDaily_formulaKey_day_key" ON "FormulaUsageDaily"("formulaKey", "day");
