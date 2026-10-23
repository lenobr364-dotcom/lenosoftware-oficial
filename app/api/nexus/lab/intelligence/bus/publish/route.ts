import { NextRequest, NextResponse } from "next/server";

import { requireNexusLabApiAccess, nexusLabJsonResponse } from "@/lib/api/nexus-lab-guard";
import { publishBusEvent } from "@/lib/services/lab-intelligence.service";
import { busPublishBodySchema } from "@/lib/validation/lab-intelligence-schemas";

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

  const parsed = busPublishBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error", issues: parsed.error.flatten() }, { status: 400 });
  }

  const event = await publishBusEvent(parsed.data.topic, parsed.data.source, parsed.data.payload);
  return NextResponse.json({ ok: true, event }, { status: 201 });
}
