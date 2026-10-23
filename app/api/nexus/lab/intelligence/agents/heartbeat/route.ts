import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { recordAgentHeartbeat } from "@/lib/services/lab-intelligence.service";
import { agentHeartbeatBodySchema } from "@/lib/validation/lab-intelligence-schemas";

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

  const parsed = agentHeartbeatBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const agent = await recordAgentHeartbeat(parsed.data.agentId, {
    status: parsed.data.status,
    metadata: parsed.data.metadata,
  });

  if (!agent) {
    return NextResponse.json({ error: "agent_not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, agent });
}
