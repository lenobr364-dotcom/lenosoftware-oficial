import type { NextRequest } from "next/server";

import { handleLicensingIssuePost } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleLicensingIssuePost(request, "/api/dashboard/licensing-engine/issue");
}
