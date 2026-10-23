export type GeoInput = {
  lat?: number | null;
  lng?: number | null;
  regionCode?: string | null;
};

export type ResolvedRegion = {
  regionCode: string;
  countryLabelKey: string;
};

/** Resolve ISO2 / operational region from coordinates (coarse bounding boxes). */
export function resolveRegionFromGeo(input: GeoInput): ResolvedRegion {
  const explicit = input.regionCode?.trim().toUpperCase();
  if (explicit && explicit.length >= 2 && explicit !== "UNKNOWN") {
    return mapRegionCode(explicit);
  }

  const lat = input.lat;
  const lng = input.lng;
  if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    if (lat >= -35 && lat <= 5 && lng >= -75 && lng <= -34) {
      if (lat >= -17 && lat <= -14 && lng >= -53 && lng <= -50) {
        return { regionCode: "BR-MT", countryLabelKey: "regionBrMt" };
      }
      return { regionCode: "BR", countryLabelKey: "regionBr" };
    }
    if (lat >= 35 && lat <= 72 && lng >= -12 && lng <= 40) {
      return { regionCode: "EU", countryLabelKey: "regionEu" };
    }
    if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) {
      return { regionCode: "US", countryLabelKey: "regionUs" };
    }
    if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
      return { regionCode: "IN", countryLabelKey: "regionIn" };
    }
    if (lat >= 12 && lat <= 45 && lng >= 25 && lng <= 65) {
      return { regionCode: "MENA", countryLabelKey: "regionMena" };
    }
  }

  return { regionCode: "GLOBAL", countryLabelKey: "regionGlobal" };
}

function mapRegionCode(code: string): ResolvedRegion {
  if (code === "BR" || code.startsWith("BR-")) {
    return code === "BR-MT" || code === "MT"
      ? { regionCode: "BR-MT", countryLabelKey: "regionBrMt" }
      : { regionCode: "BR", countryLabelKey: "regionBr" };
  }
  const known: Record<string, string> = {
    EU: "regionEu",
    DE: "regionEu",
    PT: "regionEu",
    US: "regionUs",
    IN: "regionIn",
    HI: "regionIn",
    AR: "regionMena",
  };
  return {
    regionCode: code,
    countryLabelKey: known[code] ?? "regionGlobal",
  };
}

type RegionalRule = {
  frameworkKeys: string[];
  notesKey: string;
  blockedKeywords?: string[];
};

const RULES: Record<string, RegionalRule> = {
  "BR-MT": {
    frameworkKeys: ["frameworkAnvisa", "frameworkIbama", "frameworkReachAligned"],
    notesKey: "notesBrMt",
  },
  BR: {
    frameworkKeys: ["frameworkAnvisa", "frameworkIbama", "frameworkConama"],
    notesKey: "notesBr",
  },
  EU: {
    frameworkKeys: ["frameworkReach", "frameworkClp", "frameworkGdprOps"],
    notesKey: "notesEu",
    blockedKeywords: ["nonilfenol"],
  },
  US: {
    frameworkKeys: ["frameworkTsca", "frameworkOsha", "frameworkEpa"],
    notesKey: "notesUs",
  },
  IN: {
    frameworkKeys: ["frameworkBis", "frameworkFactoriesAct"],
    notesKey: "notesIn",
  },
  MENA: {
    frameworkKeys: ["frameworkGso", "frameworkHalalOps"],
    notesKey: "notesMena",
  },
  GLOBAL: {
    frameworkKeys: ["frameworkChemvaultIntl"],
    notesKey: "notesGlobal",
  },
};

export function evaluateRegionalCompliance(
  region: ResolvedRegion,
  compositionLower: string,
): { verdict: "approved" | "conditional" | "blocked"; frameworkKeys: string[]; notesKey: string } {
  const rule = RULES[region.regionCode] ?? RULES.GLOBAL!;
  const blocked = rule.blockedKeywords?.some((k) => compositionLower.includes(k));
  if (blocked) {
    return { verdict: "blocked", frameworkKeys: rule.frameworkKeys, notesKey: "notesBlockedSubstance" };
  }
  if (region.regionCode === "EU" && compositionLower.includes("fosfat") && !compositionLower.includes("sem fosfat")) {
    return { verdict: "conditional", frameworkKeys: rule.frameworkKeys, notesKey: "notesEuPhosphate" };
  }
  if (region.regionCode.startsWith("BR")) {
    return { verdict: "approved", frameworkKeys: rule.frameworkKeys, notesKey: rule.notesKey };
  }
  return { verdict: "approved", frameworkKeys: rule.frameworkKeys, notesKey: rule.notesKey };
}
