import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { getLicenseRequestTrend30d } from "@/lib/license-trend";

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const points = await getLicenseRequestTrend30d();
  return NextResponse.json({ ok: true, points });
}
