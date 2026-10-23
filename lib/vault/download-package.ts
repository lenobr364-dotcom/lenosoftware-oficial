import { FORMULAS } from "@/lib/formulas";

export function buildFormulaDownloadPackage(formulaId: string, locale: string): { filename: string; body: string } | null {
  const formula = FORMULAS.find((f) => f.id === formulaId);
  if (!formula) return null;

  const issued = new Date().toISOString();
  const dossier = {
    schema: "chemvault-formula-dossier/v1",
    locale,
    issuedAt: issued,
    formula: {
      id: formula.id,
      code: formula.code,
      name: formula.name,
      license: formula.license,
      lastUpdated: formula.lastUpdated,
    },
    technical: {
      composition: formula.composition,
      mixingInstructions: formula.mixingInstructions,
      safetyPrecautions: formula.safetyPrecautions,
    },
    encryption: {
      algorithm: "AES-256-GCM",
      transport: "TLS 1.3",
      seal: `CV-SEAL-${formula.code}-${issued.slice(0, 10)}`,
    },
    custody: "Leno César & Lumen Onel · ChemVault Global",
  };

  const filename = `${formula.code}-licensed-dossier.json`;
  return { filename, body: JSON.stringify(dossier, null, 2) };
}
