import type { NextRequest } from "next/server";

import { handleLicensingApprove, licensingDynamic } from "@/lib/licensing/api-handlers";

export const dynamic = licensingDynamic;

const PATH = "/api/licensing/approve";

export async function POST(request: NextRequest) {
  return handleLicensingApprove(request, PATH);
}

export async function PUT(request: NextRequest) {
  return handleLicensingApprove(request, PATH);
}
