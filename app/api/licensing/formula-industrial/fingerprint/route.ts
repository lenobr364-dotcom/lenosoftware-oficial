import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { computeFormulaIndustrialFingerprintHex } from "@/lib/formula-industrial-fingerprint";
import { FORMULAS } from "@/lib/formulas";

export const dynamic = "force-dynamic";

/** Catálogo com impressões digitais SHA-256 (CEO + licença core). */
export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const catalog = FORMULAS.map((f) => {
    const { hashHex, payload } = computeFormulaIndustrialFingerprintHex(f);
    return {
      formulaId: f.id,
      code: f.code,
      name: f.name,
      licenseStatus: f.license,
      lastUpdated: f.lastUpdated,
      securityFingerprintSha256: hashHex,
      payloadVersion: payload.v,
    };
  });

  return NextResponse.json({
    ok: true,
    algorithm: "SHA-256",
    canonicalPayloadVersion: catalog[0]?.payloadVersion ?? 1,
    formulas: catalog,
  });
}
