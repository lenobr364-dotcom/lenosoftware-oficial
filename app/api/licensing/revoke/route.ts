import type { NextRequest } from "next/server";

import { handleLicensingRevoke, licensingDynamic } from "@/lib/licensing/api-handlers";

export const dynamic = licensingDynamic;

const PATH = "/api/licensing/revoke";

export async function POST(request: NextRequest) {
  return handleLicensingRevoke(request, PATH);
}

export async function PUT(request: NextRequest) {
  return handleLicensingRevoke(request, PATH);
}
