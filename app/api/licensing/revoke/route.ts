import type { NextRequest } from "next/server";

import { handleLicensingRevoke } from "@/lib/licensing/api-handlers";

export const dynamic = "force-dynamic";

const PATH = "/api/licensing/revoke";

export async function POST(request: NextRequest) {
  return handleLicensingRevoke(request, PATH);
}

export async function PUT(request: NextRequest) {
  return handleLicensingRevoke(request, PATH);
}
