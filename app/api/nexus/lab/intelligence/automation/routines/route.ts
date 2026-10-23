import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { listAutomationRoutines } from "@/lib/services/lab-intelligence.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  return NextResponse.json({
    ok: true,
    routines: listAutomationRoutines(),
  });
}
