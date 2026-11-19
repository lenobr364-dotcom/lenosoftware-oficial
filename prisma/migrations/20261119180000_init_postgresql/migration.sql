-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('USD', 'EUR', 'BRL');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "SecuritySeverity" NOT NULL DEFAULT 'WARNING',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "requestPath" TEXT,
    "requestId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseActivity" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'unknown',
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaUsageDaily" (
    "id" TEXT NOT NULL,
    "formulaKey" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormulaUsageDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseGeoPolicy" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "allowedRegionCodes" TEXT NOT NULL,
    "anomalyWindowMinutes" INTEGER NOT NULL DEFAULT 15,
    "massOffRegionThreshold" INTEGER NOT NULL DEFAULT 6,
    "suspendMinutes" INTEGER NOT NULL DEFAULT 45,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseGeoPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseSuspension" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseRequest" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "corporateEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternationalLicenseAcceptance" (
    "id" TEXT NOT NULL,
    "transactionCode" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "signerEmail" TEXT,
    "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternationalLicenseAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formula" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo_principal" TEXT,
    "instrucoes" TEXT NOT NULL,
    "licenciada" BOOLEAN NOT NULL DEFAULT false,
    "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustrialFormula" (
    "id" TEXT NOT NULL,
    "idFormula" TEXT NOT NULL,
    "nomeComercial" TEXT NOT NULL,
    "aplicacao" TEXT NOT NULL,
    "phIdeal" DOUBLE PRECISION NOT NULL,
    "margemLucroEstimadaPercentual" DOUBLE PRECISION NOT NULL,
    "instrucoesSeguranca" TEXT NOT NULL,
    "licenciada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustrialFormula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "industrialFormulaId" TEXT NOT NULL,
    "nomeTecnico" TEXT NOT NULL,
    "concentracaoPercentual" DOUBLE PRECISION NOT NULL,
    "custoPorKgDolar" DOUBLE PRECISION NOT NULL,
    "funcaoQuimica" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaIndustrialLicense" (
    "id" TEXT NOT NULL,
    "clientSubject" TEXT NOT NULL,
    "formulaCode" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "grantHash" TEXT NOT NULL,
    "chainAnchor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormulaIndustrialLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaAuditLog" (
    "id" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorSubject" TEXT,
    "requestId" TEXT,
    "snapshotBefore" TEXT,
    "snapshotAfter" TEXT,
    "rowIntegrity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormulaAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveSettings" (
    "id" TEXT NOT NULL,
    "passwordHash" TEXT,
    "adminMfaModeOverride" TEXT,
    "totpSecretBase32" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutiveSettings_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "LicenseGeoPolicy_subject_key" ON "LicenseGeoPolicy"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseSuspension_subject_key" ON "LicenseSuspension"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "InternationalLicenseAcceptance_transactionCode_key" ON "InternationalLicenseAcceptance"("transactionCode");

-- CreateIndex
CREATE INDEX "Formula_nome_idx" ON "Formula"("nome");

-- CreateIndex
CREATE INDEX "Formula_categoria_idx" ON "Formula"("categoria");

-- CreateIndex
CREATE INDEX "Formula_licenciada_nome_idx" ON "Formula"("licenciada", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "IndustrialFormula_idFormula_key" ON "IndustrialFormula"("idFormula");

-- CreateIndex
CREATE INDEX "IndustrialFormula_licenciada_nomeComercial_idx" ON "IndustrialFormula"("licenciada", "nomeComercial");

-- CreateIndex
CREATE INDEX "Ingredient_industrialFormulaId_idx" ON "Ingredient"("industrialFormulaId");

-- CreateIndex
CREATE UNIQUE INDEX "FormulaIndustrialLicense_grantHash_key" ON "FormulaIndustrialLicense"("grantHash");

-- CreateIndex
CREATE INDEX "FormulaIndustrialLicense_clientSubject_formulaCode_status_idx" ON "FormulaIndustrialLicense"("clientSubject", "formulaCode", "status");

-- CreateIndex
CREATE INDEX "FormulaIndustrialLicense_validUntil_idx" ON "FormulaIndustrialLicense"("validUntil");

-- CreateIndex
CREATE INDEX "FormulaAuditLog_formulaId_createdAt_idx" ON "FormulaAuditLog"("formulaId", "createdAt");

-- CreateIndex
CREATE INDEX "FormulaAuditLog_createdAt_idx" ON "FormulaAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_industrialFormulaId_fkey" FOREIGN KEY ("industrialFormulaId") REFERENCES "IndustrialFormula"("id") ON DELETE CASCADE ON UPDATE CASCADE;
