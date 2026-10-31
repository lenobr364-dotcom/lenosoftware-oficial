import type { NextRequest } from "next/server";

import { handleLicensingIssuePost } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

const PATH = "/api/licensing/issue";

export async function POST(request: NextRequest) {
  return handleLicensingIssuePost(request, PATH);
}
