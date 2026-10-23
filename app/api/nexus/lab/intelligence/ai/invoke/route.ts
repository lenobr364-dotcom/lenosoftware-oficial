import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { invokeLabAiAction } from "@/lib/services/lab-intelligence.service";
import { aiInvokeBodySchema } from "@/lib/validation/lab-intelligence-schemas";

export const dynamic = "force-dynamic";

/**
 * POST — ponte para ferramentas de IA (Gemini, agentes externos, handoff modular).
 */
export async function POST(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = aiInvokeBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await invokeLabAiAction(parsed.data);
    return NextResponse.json({ ok: true, result, invokedBy: guard.mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ai_invoke_failed";
    const status =
      message === "formula_not_found" || message === "formula_id_required"
        ? 400
        : message === "handoff_required"
          ? 400
          : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
