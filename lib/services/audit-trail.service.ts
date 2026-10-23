import { buildAuditTrailPage } from "@/lib/audit/audit-trail.builder";
import type { AuditTrailQuery } from "@/lib/audit/types";

export async function getAuditTrailPage(query: AuditTrailQuery) {
  return buildAuditTrailPage(query);
}
