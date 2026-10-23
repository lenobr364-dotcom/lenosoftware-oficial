import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { registerAgent } from "@/lib/services/lab-intelligence.service";
import { publishBusEvent } from "@/lib/lab/intelligence/module-bus";
import { registerAgentBodySchema } from "@/lib/validation/lab-intelligence-schemas";

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

  const parsed = registerAgentBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const agent = await registerAgent(parsed.data);
  await publishBusEvent("lab.agents.registered", guard.mode === "agent" ? "agent:bearer" : "ceo:session", {
    agentId: agent.id,
    kind: agent.kind,
  });

  return NextResponse.json({ ok: true, agent }, { status: 201 });
}
