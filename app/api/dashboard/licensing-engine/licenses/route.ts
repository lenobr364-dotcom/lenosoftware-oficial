import type { NextRequest } from "next/server";

import { handleLicensingLicensesGet } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleLicensingLicensesGet(request);
}
