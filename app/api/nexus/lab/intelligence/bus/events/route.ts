import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { listBusEvents } from "@/lib/services/lab-intelligence.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const since = request.nextUrl.searchParams.get("since") ?? undefined;
  const topic = request.nextUrl.searchParams.get("topic") ?? undefined;
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50), 200);

  const events = await listBusEvents({
    since,
    topic,
    limit: Number.isFinite(limit) ? limit : 50,
  });

  return NextResponse.json({ ok: true, events });
}
