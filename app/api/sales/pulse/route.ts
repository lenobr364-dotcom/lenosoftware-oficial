import { NextRequest, NextResponse } from "next/server";

import { clientIpHint, inferCountryIso2FromHeaders } from "@/lib/request-meta";
import { recordSalesPulse } from "@/lib/sales-activity-feed";
import { salesPulseBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const parsed = salesPulseBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const country = inferCountryIso2FromHeaders(request.headers);
  const ip = clientIpHint(request);
  const ev = recordSalesPulse({ countryIso2: country, plan: parsed.data.plan, ipHint: ip });
  if (!ev) {
    return NextResponse.json({ ok: true, recorded: false, reason: "throttled" });
  }
  return NextResponse.json({ ok: true, recorded: true, id: ev.id });
}
