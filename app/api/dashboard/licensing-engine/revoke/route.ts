import type { NextRequest } from "next/server";

import { handleLicensingRevoke } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleLicensingRevoke(request, "/api/dashboard/licensing-engine/revoke");
}
