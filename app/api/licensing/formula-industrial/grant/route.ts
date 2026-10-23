import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { mintFormulaIndustrialLicense } from "@/lib/formula-license-smart-contract";
import { resolveIndustrialFormulaCode } from "@/lib/industrial-formula-persistence";
import { FORMULAS } from "@/lib/formulas";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  clientSubject: z.string().min(2).max(200),
  formulaCode: z.string().min(2).max(64),
  validFrom: z.string().min(8).max(64),
  validUntil: z.string().min(8).max(64),
});

/** Emite nova licença (mint) no contrato simulado — persistido em BD. */
export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", details: parsed.error.flatten() }, { status: 400 });
  }

  const code = parsed.data.formulaCode.trim();
  const known = FORMULAS.find((f) => f.code === code);
  const industrial = known ? null : await resolveIndustrialFormulaCode(code);
  if (!known && !industrial) {
    return NextResponse.json({ error: "unknown_formula_code" }, { status: 404 });
  }

  const validFrom = new Date(parsed.data.validFrom);
  const validUntil = new Date(parsed.data.validUntil);
  if (!(validUntil.getTime() > validFrom.getTime())) {
    return NextResponse.json({ error: "invalid_date_range" }, { status: 400 });
  }

  const minted = await mintFormulaIndustrialLicense({
    clientSubject: parsed.data.clientSubject,
    formulaCode: code,
    validFrom,
    validUntil,
  });

  return NextResponse.json({
    ok: true,
    contractId: "chemvault:formula-license:v1",
    formulaId: known?.id ?? industrial!.id,
    formulaCode: code,
    ...minted,
  });
}
