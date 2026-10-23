import { checkCompliance } from "@/lib/chemistry/compliance";
import type { LicenseStatus } from "@/lib/formulas";
import { FORMULAS } from "@/lib/formulas";
import { assertGeoAccessForSubject } from "@/lib/license-geofence";
import { deriveIngredientsFromComposition } from "@/lib/simulator/formula-params";
import {
  evaluateRegionalCompliance,
  resolveRegionFromGeo,
  type GeoInput,
} from "@/lib/simulator/regional-compliance";
import type { VaultDownloadBlockReason } from "@/lib/vault/types";

export type VaultAccessInput = GeoInput & {
  formulaId: string;
  actorSubject: string;
};

export type VaultAccessVerdict = {
  allowed: boolean;
  blockReason: VaultDownloadBlockReason;
  regionalVerdict: "approved" | "conditional" | "blocked" | "unknown";
  regionCode: string;
  regionLabelKey: string;
};

function licenseBlock(license: LicenseStatus): VaultDownloadBlockReason {
  if (license === "pending") return "license_pending";
  if (license === "active" || license === "renewal") return "none";
  return "license_unknown";
}

export async function evaluateVaultDownloadAccess(input: VaultAccessInput): Promise<VaultAccessVerdict> {
  const formula = FORMULAS.find((f) => f.id === input.formulaId);
  if (!formula) {
    return {
      allowed: false,
      blockReason: "license_unknown",
      regionalVerdict: "unknown",
      regionCode: "GLOBAL",
      regionLabelKey: "regionGlobal",
    };
  }

  const licenseReason = licenseBlock(formula.license);
  if (licenseReason !== "none") {
    const region = resolveRegionFromGeo(input);
    return {
      allowed: false,
      blockReason: licenseReason,
      regionalVerdict: "unknown",
      regionCode: region.regionCode,
      regionLabelKey: region.countryLabelKey,
    };
  }

  const region = resolveRegionFromGeo(input);
  const geo = await assertGeoAccessForSubject(input.actorSubject, region.regionCode);
  if (!geo.ok) {
    return {
      allowed: false,
      blockReason: "geo_denied",
      regionalVerdict: "blocked",
      regionCode: region.regionCode,
      regionLabelKey: region.countryLabelKey,
    };
  }

  const regionalEval = evaluateRegionalCompliance(region, formula.composition.toLowerCase());
  if (regionalEval.verdict === "blocked") {
    return {
      allowed: false,
      blockReason: "regional_blocked",
      regionalVerdict: "blocked",
      regionCode: region.regionCode,
      regionLabelKey: region.countryLabelKey,
    };
  }
  if (regionalEval.verdict === "conditional") {
    return {
      allowed: false,
      blockReason: "regional_conditional",
      regionalVerdict: "conditional",
      regionCode: region.regionCode,
      regionLabelKey: region.countryLabelKey,
    };
  }

  const ingredients = deriveIngredientsFromComposition(formula.composition);
  const compliance = checkCompliance(ingredients);
  if (!compliance.isCompliant) {
    return {
      allowed: false,
      blockReason: "compliance",
      regionalVerdict: "approved",
      regionCode: region.regionCode,
      regionLabelKey: region.countryLabelKey,
    };
  }

  return {
    allowed: true,
    blockReason: "none",
    regionalVerdict: "approved",
    regionCode: region.regionCode,
    regionLabelKey: region.countryLabelKey,
  };
}
