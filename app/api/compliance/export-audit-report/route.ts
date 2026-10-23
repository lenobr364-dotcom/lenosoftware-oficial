import type { NextRequest } from "next/server";

import { handleComplianceExportAuditReportPost } from "@/lib/compliance/api-handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleComplianceExportAuditReportPost(request, "/api/compliance/export-audit-report");
}
