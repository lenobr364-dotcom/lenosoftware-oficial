import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { evaluateRulesWithOptionalContext } from "@/lib/services/lab-intelligence.service";
import { rulesEvaluateBodySchema } from "@/lib/validation/lab-intelligence-schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const guard = await requireNexusLabApiAccess(request);
  if (guard instanceof Response) return guard;

  let raw: unknown = {};
  if (request.headers.get("content-length") !== "0") {
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
  }

  const parsed = rulesEvaluateBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { context, results } = await evaluateRulesWithOptionalContext(parsed.data.context);
  return NextResponse.json({ ok: true, context, results });
}
