import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { getIndustrialFormulaByCode } from "@/lib/industrial-formula-persistence";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, ctx: { params: Promise<{ idFormula: string }> }) {
  const guard = await requireCeoAndCoreLicense(_request);
  if (guard instanceof NextResponse) return guard;

  const { idFormula } = await ctx.params;
  const code = idFormula?.trim();
  if (!code) return NextResponse.json({ error: "missing_id_formula" }, { status: 400 });

  const formula = await getIndustrialFormulaByCode(code);
  if (!formula) {
    return NextResponse.json({ error: "industrial_formula_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, formula });
}
