import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { readSalesPulseEvents } from "@/lib/sales-activity-feed";

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true, events: readSalesPulseEvents() });
}
