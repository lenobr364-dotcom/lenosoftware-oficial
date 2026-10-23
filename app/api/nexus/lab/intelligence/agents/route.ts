import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { listAgents } from "@/lib/services/lab-intelligence.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  const agents = await listAgents();
  return NextResponse.json({ ok: true, agents });
}
