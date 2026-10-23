import type { NextRequest } from "next/server";

import { handleLicensingIssuePost, licensingDynamic } from "@/lib/licensing/api-handlers";

export const dynamic = licensingDynamic;

const PATH = "/api/licensing/issue";

export async function POST(request: NextRequest) {
  return handleLicensingIssuePost(request, PATH);
}
