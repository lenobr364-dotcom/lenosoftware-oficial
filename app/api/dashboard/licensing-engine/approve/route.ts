import type { NextRequest } from "next/server";

import { handleLicensingApprove } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleLicensingApprove(request, "/api/dashboard/licensing-engine/approve");
}
