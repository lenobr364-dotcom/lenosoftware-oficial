import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import {
  createIndustrialFormula,
  listIndustrialFormulas,
} from "@/lib/industrial-formula-persistence";
import { createIndustrialFormulaBodySchema } from "@/lib/validation/industrial-formula-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const formulas = await listIndustrialFormulas();
  return NextResponse.json({ ok: true, formulas });
}

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createIndustrialFormulaBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  try {
    const formula = await createIndustrialFormula(parsed.data);
    return NextResponse.json({ ok: true, formula }, { status: 201 });
  } catch (err) {
    const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "id_formula_already_exists" }, { status: 409 });
    }
    throw err;
  }
}
