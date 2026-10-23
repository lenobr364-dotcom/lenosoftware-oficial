import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import { prisma } from "@/lib/prisma";
import { recordFormulaImpressionsBatch } from "@/lib/telemetry-db";

export const dynamic = "force-dynamic";

const MAX = 48;
const DEFAULT = 24;

export async function GET(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return guard;

  const sp = request.nextUrl.searchParams;
  const rawLimit = Number.parseInt(sp.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(MAX, Math.max(1, rawLimit)) : DEFAULT;
  const cursor = sp.get("cursor")?.trim() || null;

  try {
    const take = limit + 1;
    const rows = await prisma.formula.findMany({
      orderBy: { id: "asc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const formulas = slice.map(decryptFormulaRow);
    const nextCursor = hasMore && formulas.length > 0 ? formulas[formulas.length - 1]!.id : null;

    if (formulas.length > 0) {
      void recordFormulaImpressionsBatch(formulas.map((f) => f.id));
    }

    return NextResponse.json({ ok: true, formulas, nextCursor });
  } catch {
    return NextResponse.json({ ok: false, error: "catalog_fetch_failed" }, { status: 500 });
  }
}
