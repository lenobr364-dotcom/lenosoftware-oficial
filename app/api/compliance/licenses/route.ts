import type { NextRequest } from "next/server";

import { handleComplianceLicensesGet } from "@/lib/compliance/api-handlers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleComplianceLicensesGet(request);
}
