import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [live, security] = await Promise.all([
    prisma.licenseActivity.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        subject: true,
        channel: true,
        region: true,
        createdAt: true,
      },
    }),
    prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        requestPath: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json(
    { ok: true, live, security },
    { headers: { "Cache-Control": "private, max-age=0, must-revalidate" } },
  );
}
