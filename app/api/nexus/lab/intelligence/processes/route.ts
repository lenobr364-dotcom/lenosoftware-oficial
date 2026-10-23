import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { listProcesses } from "@/lib/services/lab-intelligence.service";
import type { ProcessStatus } from "@/lib/lab/intelligence/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam as ProcessStatus | null;
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 40), 100);

  const processes = await listProcesses({
    status: status && ["pending", "running", "completed", "failed", "cancelled"].includes(status)
      ? status
      : undefined,
    limit: Number.isFinite(limit) ? limit : 40,
  });

  return NextResponse.json({ ok: true, processes });
}
