import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_TAKE = 200;

export type FormulaAuditApiEntry = {
  id: string;
  formulaId: string;
  action: string;
  actorSubject: string | null;
  requestId: string | null;
  createdAt: string;
  snapshotBeforePreview: string | null;
  snapshotAfterPreview: string | null;
};

function preview(json: string | null, max = 240): string | null {
  if (!json) return null;
  if (json.length <= max) return json;
  return `${json.slice(0, max)}…`;
}

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const actor = searchParams.get("actor")?.trim();
  const formulaId = searchParams.get("formulaId")?.trim();
  const take = Math.min(MAX_TAKE, Math.max(1, Number(searchParams.get("take") ?? "80") || 80));

  const where: Prisma.FormulaAuditLogWhereInput = {};
  const createdAt: Prisma.DateTimeFilter = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) createdAt.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
  }
  if (Object.keys(createdAt).length > 0) {
    where.createdAt = createdAt;
  }
  if (actor) {
    where.actorSubject = { contains: actor };
  }
  if (formulaId) {
    where.formulaId = formulaId;
  }

  const rows = await prisma.formulaAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  const entries: FormulaAuditApiEntry[] = rows.map((r) => ({
    id: r.id,
    formulaId: r.formulaId,
    action: r.action,
    actorSubject: r.actorSubject,
    requestId: r.requestId,
    createdAt: r.createdAt.toISOString(),
    snapshotBeforePreview: preview(r.snapshotBefore),
    snapshotAfterPreview: preview(r.snapshotAfter),
  }));

  return NextResponse.json({ ok: true as const, entries });
}
