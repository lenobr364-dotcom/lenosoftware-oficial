import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { runAutomationRoutine } from "@/lib/services/lab-intelligence.service";
import { automationRunBodySchema } from "@/lib/validation/lab-intelligence-schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = automationRunBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await runAutomationRoutine(parsed.data.routineId);
    return NextResponse.json({ ok: true, ...result, triggeredBy: guard.mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "automation_run_failed";
    const status = message === "routine_not_found" ? 404 : message === "routine_disabled" ? 409 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
