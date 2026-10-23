import {
  buildLicensingEnginePage,
  invalidateLicenseEngineCache,
} from "@/lib/licensing-engine/license-registry.builder";
import type { LicensingEngineQuery } from "@/lib/licensing-engine/types";
import {
  approveFormulaIndustrialLicense,
  issuePendingFormulaIndustrialLicense,
  revokeFormulaIndustrialLicense,
} from "@/lib/formula-license-smart-contract";
import { FORMULAS } from "@/lib/formulas";

export async function getLicensingEnginePage(query: LicensingEngineQuery) {
  return buildLicensingEnginePage(query);
}

export async function issueEngineLicense(input: {
  clientSubject: string;
  formulaCode: string;
  validFrom: Date;
  validUntil: Date;
}) {
  const known = FORMULAS.find((f) => f.code === input.formulaCode.trim());
  if (!known) return { ok: false as const, error: "unknown_formula_code" };

  const validUntil = input.validUntil;
  const validFrom = input.validFrom;
  if (!(validUntil.getTime() > validFrom.getTime())) {
    return { ok: false as const, error: "invalid_date_range" };
  }

  const minted = await issuePendingFormulaIndustrialLicense({
    clientSubject: input.clientSubject,
    formulaCode: input.formulaCode.trim(),
    validFrom,
    validUntil,
  });
  invalidateLicenseEngineCache();
  return { ok: true as const, license: minted, formulaId: known.id, formulaName: known.name };
}

export async function approveEngineLicense(id: string) {
  const row = await approveFormulaIndustrialLicense(id);
  if (!row) return { ok: false as const, error: "license_not_pending" };
  invalidateLicenseEngineCache();
  return { ok: true as const, license: row };
}

export async function revokeEngineLicense(id: string) {
  const row = await revokeFormulaIndustrialLicense(id);
  if (!row) return { ok: false as const, error: "license_not_revokable" };
  invalidateLicenseEngineCache();
  return { ok: true as const, license: row };
}
