import { SecuritySeverity } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Alertas críticos recentes para toast / badge (polling leve). */
export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const since = new Date(Date.now() - 60 * 60 * 1000);

  const critical = await prisma.securityEvent.findMany({
    where: {
      severity: SecuritySeverity.CRITICAL,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { id: true, title: true, detail: true, type: true, createdAt: true },
  });

  return NextResponse.json(
    { ok: true, critical },
    { headers: { "Cache-Control": "private, max-age=0, must-revalidate" } },
  );
}
