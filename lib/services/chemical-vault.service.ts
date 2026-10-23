import { buildFormulaDownloadPackage } from "@/lib/vault/download-package";
import { evaluateVaultDownloadAccess } from "@/lib/vault/access-gate";
import { buildVaultCatalog } from "@/lib/vault/vault-catalog.builder";
import type { GeoInput } from "@/lib/simulator/regional-compliance";
import type { VaultDownloadResult } from "@/lib/vault/types";

export async function getChemicalVaultCatalog(actorSubject: string, geo: GeoInput) {
  return buildVaultCatalog(actorSubject, geo);
}

export async function requestVaultDownload(
  actorSubject: string,
  formulaId: string,
  geo: GeoInput,
  locale: string,
): Promise<VaultDownloadResult> {
  const access = await evaluateVaultDownloadAccess({ ...geo, formulaId, actorSubject });
  if (!access.allowed) {
    return { ok: false, reason: access.blockReason };
  }

  const pack = buildFormulaDownloadPackage(formulaId, locale);
  if (!pack) {
    return { ok: false, reason: "license_unknown" };
  }

  return {
    ok: true,
    filename: pack.filename,
    contentType: "application/json; charset=utf-8",
    body: pack.body,
  };
}
