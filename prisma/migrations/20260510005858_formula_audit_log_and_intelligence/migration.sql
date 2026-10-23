-- CreateTable
CREATE TABLE "FormulaAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formulaId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorSubject" TEXT,
    "requestId" TEXT,
    "snapshotBefore" TEXT,
    "snapshotAfter" TEXT,
    "rowIntegrity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "FormulaAuditLog_formulaId_createdAt_idx" ON "FormulaAuditLog"("formulaId", "createdAt");

-- CreateIndex
CREATE INDEX "FormulaAuditLog_createdAt_idx" ON "FormulaAuditLog"("createdAt");
