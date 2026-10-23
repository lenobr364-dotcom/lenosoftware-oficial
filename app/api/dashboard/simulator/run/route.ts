import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCeoAndCoreLicense } from "@/lib/api-dashboard-write-guard";
import { recordAuditEvent } from "@/lib/audit/record-audit-event";
import { executeFormulaSimulation } from "@/lib/services/formula-simulator.service";
import { applySecurityHeaders } from "@/lib/security/http-security";
import { clientIpHint, inferRegionFromHeaders } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  formulaId: z.string().min(1).max(64),
  locale: z.string().max(8).optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .nullable()
    .optional(),
  regionCode: z.string().max(16).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const guard = await requireCeoAndCoreLicense(request);
  if (guard instanceof NextResponse) return applySecurityHeaders(guard, "api");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const res = NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const res = NextResponse.json({ ok: false, error: "validation_error" }, { status: 400 });
    return applySecurityHeaders(res, "api");
  }

  const headerRegion = inferRegionFromHeaders(request);
  const regionCode = parsed.data.regionCode ?? headerRegion;

  try {
    const report = await executeFormulaSimulation({
      formulaId: parsed.data.formulaId,
      locale: parsed.data.locale,
      coordinates: parsed.data.coordinates ?? null,
      regionCode,
      actorSubject: guard.actorSubject,
    });

    const ip = clientIpHint(request);
    if (!report.overallPassed) {
      recordAuditEvent({
        category: "simulator_compliance_fail",
        severity: report.compliance.isCompliant ? "warning" : "critical",
        outcome: "failure",
        actorSubject: guard.actorSubject,
        resource: parsed.data.formulaId,
        region: regionCode,
        messageKey: "eventSimulatorComplianceFail",
        messageParams: {
          formulaId: parsed.data.formulaId,
          violations: report.compliance.violations.length,
        },
        requestPath: "/api/dashboard/simulator/run",
        ip,
      });
    } else {
      recordAuditEvent({
        category: "simulator_run",
        severity: "info",
        outcome: "success",
        actorSubject: guard.actorSubject,
        resource: parsed.data.formulaId,
        region: regionCode,
        messageKey: "eventSimulatorRun",
        messageParams: { formulaId: parsed.data.formulaId },
        requestPath: "/api/dashboard/simulator/run",
        ip,
      });
    }

    const res = NextResponse.json({ ok: true, report });
    return applySecurityHeaders(res, "api");
  } catch (error) {
    const message = error instanceof Error ? error.message : "simulation_failed";
    const status = message === "formula_not_found" ? 404 : 500;
    const res = NextResponse.json({ ok: false, error: message }, { status });
    return applySecurityHeaders(res, "api");
  }
}
