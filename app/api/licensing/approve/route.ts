import type { NextRequest } from "next/server";

import { handleLicensingApprove } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

const PATH = "/api/licensing/approve";

export async function POST(request: NextRequest) {
  return handleLicensingApprove(request, PATH);
}

export async function PUT(request: NextRequest) {
  return handleLicensingApprove(request, PATH);
}
