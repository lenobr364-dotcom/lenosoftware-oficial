import { NextRequest, NextResponse } from "next/server";

import { requireFormulaAgentSecret } from "@/lib/formula-license-agent-auth";
import { evaluateLicenseValidity, listFormulaIndustrialLicenses } from "@/lib/formula-license-smart-contract";
import { computeFormulaIndustrialFingerprintHex } from "@/lib/formula-industrial-fingerprint";
import { FORMULAS } from "@/lib/formulas";

export const dynamic = "force-dynamic";

/**
 * Auditoria autónoma: impressões digitais + licenças ativas/expiradas.
 * Autenticação: Authorization: Bearer CHEMVAULT_FORMULA_AGENT_SECRET
 */
export async function GET(request: NextRequest) {
  const agent = requireFormulaAgentSecret(request);
  if (agent instanceof NextResponse) return agent;

  const licenses = await listFormulaIndustrialLicenses();

  const fingerprints = FORMULAS.map((f) => {
    const { hashHex } = computeFormulaIndustrialFingerprintHex(f);
    return { formulaId: f.id, code: f.code, securityFingerprintSha256: hashHex };
  });

  const grants = licenses.map((r) => ({
    id: r.id,
    clientSubject: r.clientSubject,
    formulaCode: r.formulaCode,
    validFrom: r.validFrom.toISOString(),
    validUntil: r.validUntil.toISOString(),
    status: r.status,
    validity: evaluateLicenseValidity(r),
    grantHash: r.grantHash,
    chainAnchor: r.chainAnchor,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    agent: "chemvault-formula-license-auditor",
    simulatedContract: "chemvault:formula-license:v1",
    fingerprints,
    grants,
  });
}
