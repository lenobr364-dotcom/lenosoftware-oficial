import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import { deleteFormulaAudited, updateFormulaAudited } from "@/lib/formula-persistence";
import { prisma } from "@/lib/prisma";
import { newRequestId } from "@/lib/server-logger";
import { patchFormulaBodySchema } from "@/lib/validation/formula-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const formulaId = id?.trim();
  if (!formulaId) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = patchFormulaBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "empty_patch" }, { status: 400 });
  }

  const requestId = newRequestId();
  const updated = await updateFormulaAudited(guard.actorSubject, formulaId, parsed.data, requestId);
  if (!updated) {
    return NextResponse.json({ error: "formula_not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, formula: updated, requestId });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const formulaId = id?.trim();
  if (!formulaId) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const requestId = newRequestId();
  const ok = await deleteFormulaAudited(guard.actorSubject, formulaId, requestId);
  if (!ok) {
    return NextResponse.json({ error: "formula_not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, requestId });
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const formulaId = id?.trim();
  if (!formulaId) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const row = await prisma.formula.findUnique({ where: { id: formulaId } });
  if (!row) return NextResponse.json({ error: "formula_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, formula: decryptFormulaRow(row) });
}
