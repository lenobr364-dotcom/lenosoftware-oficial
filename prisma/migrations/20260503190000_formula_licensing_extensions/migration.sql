-- RedefineFormula: international licensing dossier, hardware bridges (Eco-Bocal), steward
ALTER TABLE "Formula" ADD COLUMN "technicalDossier" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Formula" ADD COLUMN "hardwareIntegrationProfile" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Formula" ADD COLUMN "licensingTags" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Formula" ADD COLUMN "stewardAuthor" TEXT NOT NULL DEFAULT 'Leno César';
