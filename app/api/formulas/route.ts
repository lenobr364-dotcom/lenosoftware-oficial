import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { createFormulaAudited } from "@/lib/formula-persistence";
import { getFormulasCatalogCached } from "@/lib/formulas-catalog-cached";
import { newRequestId } from "@/lib/server-logger";
import { createFormulaBodySchema } from "@/lib/validation/formula-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const revalidate = 120;

export async function GET() {
  const formulas = await getFormulasCatalogCached();
  return NextResponse.json(formulas);
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
  const parsed = createFormulaBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const requestId = newRequestId();
  const row = await createFormulaAudited(guard.actorSubject, parsed.data, requestId);
  return NextResponse.json({ ok: true, id: row.id, requestId }, { status: 201 });
}
