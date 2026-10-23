import type { NextRequest } from "next/server";

import { handleComplianceGenerateCertificatePost } from "@/lib/compliance/api-handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleComplianceGenerateCertificatePost(request, "/api/compliance/generate-certificate");
}
