import { FORMULAS_CATALOG } from "@/lib/formulas-catalog";
import { evaluateVaultDownloadAccess } from "@/lib/vault/access-gate";
import type { GeoInput } from "@/lib/simulator/regional-compliance";
import { resolveRegionFromGeo } from "@/lib/simulator/regional-compliance";
import type { VaultCatalogPayload, VaultFormulaItem } from "@/lib/vault/types";

const KEY_ID = process.env.CHEMVAULT_FORMULA_ENCRYPTION_KEY?.trim()
  ? "cvk-dedicated"
  : "cvk-session-derived";

function sizeHintFor(id: string): string {
  const map: Record<string, string> = {
    "arla-32": "~42 KB",
    solupan: "~38 KB",
    intercap: "~51 KB",
  };
  return map[id] ?? "~40 KB";
}

export async function buildVaultCatalog(
  actorSubject: string,
  geo: GeoInput,
): Promise<VaultCatalogPayload> {
  const region = resolveRegionFromGeo(geo);
  const items: VaultFormulaItem[] = [];

  for (const row of FORMULAS_CATALOG) {
    const access = await evaluateVaultDownloadAccess({
      ...geo,
      formulaId: row.id,
      actorSubject,
    });

    const encryptionStatus = row.license === "renewal" ? "aes256_rotating" : "aes256_active";

    items.push({
      id: row.id,
      name: row.name,
      code: row.code,
      license: row.license,
      lastUpdated: row.lastUpdated,
      encryption: {
        algorithm: "AES-256-GCM",
        status: encryptionStatus,
        keyId: KEY_ID,
        atRest: true,
      },
      downloadReady: access.allowed,
      blockReason: access.blockReason,
      regionalVerdict: access.regionalVerdict,
      fileLabel: `${row.code}-licensed-dossier.json`,
      sizeHint: sizeHintFor(row.id),
    });
  }

  return {
    items,
    regionCode: region.regionCode,
    regionLabelKey: region.countryLabelKey,
    stats: {
      total: items.length,
      encrypted: items.filter((i) => i.encryption.atRest).length,
      downloadReady: items.filter((i) => i.downloadReady).length,
    },
  };
}
