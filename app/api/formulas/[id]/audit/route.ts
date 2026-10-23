import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { listFormulaAuditLogs } from "@/lib/formula-audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  const formulaId = id?.trim();
  if (!formulaId) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const take = Number(searchParams.get("take") ?? "100");
  const rows = await listFormulaAuditLogs(formulaId, Number.isFinite(take) ? take : 100);
  return NextResponse.json({ ok: true, formulaId, entries: rows });
}
