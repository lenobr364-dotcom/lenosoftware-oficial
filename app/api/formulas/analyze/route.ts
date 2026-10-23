import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import { analyzeFormulaRow } from "@/lib/formula-intelligence/formula-analysis-service";
import { prisma } from "@/lib/prisma";
import { formulaAnalyzeBodySchema } from "@/lib/validation/formula-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = formulaAnalyzeBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const row = await prisma.formula.findUnique({ where: { id: parsed.data.formulaId } });
  if (!row) {
    return NextResponse.json({ error: "formula_not_found" }, { status: 404 });
  }

  const analysis = await analyzeFormulaRow(decryptFormulaRow(row));
  return NextResponse.json({ ok: true, formulaId: row.id, analysis });
}
