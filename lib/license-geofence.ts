import { SecuritySeverity } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { recordSecurityEvent } from "@/lib/telemetry-db";

export function parseAllowedRegionCodes(csv: string): Set<string> {
  return new Set(
    csv
      .split(/[,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0 && s.length <= 8),
  );
}

export async function isSubjectSuspended(subject: string): Promise<boolean> {
  const row = await prisma.licenseSuspension.findUnique({
    where: { subject },
    select: { until: true },
  });
  if (!row) return false;
  return row.until.getTime() > Date.now();
}

export async function assertGeoAccessForSubject(
  subject: string,
  region: string,
): Promise<{ ok: true } | { ok: false; reason: "geo_policy" | "suspended" }> {
  if (await isSubjectSuspended(subject)) {
    return { ok: false, reason: "suspended" };
  }
  const policy = await prisma.licenseGeoPolicy.findUnique({
    where: { subject },
    select: {
      enabled: true,
      allowedRegionCodes: true,
    },
  });
  if (!policy || !policy.enabled) {
    return { ok: true };
  }
  const allowed = parseAllowedRegionCodes(policy.allowedRegionCodes);
  if (allowed.size === 0) {
    return { ok: true };
  }
  const r = region.trim().toUpperCase();
  if (r === "UNKNOWN") {
    return { ok: true };
  }
  if (!allowed.has(r)) {
    return { ok: false, reason: "geo_policy" };
  }
  return { ok: true };
}

/**
 * Após telemetria: volume de acessos fora da região contratada na janela → suspensão + alerta crítico.
 */
export async function evaluateRegionalMassAnomaly(subject: string): Promise<void> {
  const policy = await prisma.licenseGeoPolicy.findUnique({ where: { subject } });
  if (!policy || !policy.enabled) return;

  const allowed = parseAllowedRegionCodes(policy.allowedRegionCodes);
  if (allowed.size === 0) return;

  const windowMs = Math.min(120, Math.max(5, policy.anomalyWindowMinutes)) * 60 * 1000;
  const since = new Date(Date.now() - windowMs);

  const rows = await prisma.licenseActivity.findMany({
    where: { subject, createdAt: { gte: since } },
    select: { region: true },
  });

  const offRegionHits = rows.filter((row) => {
    const r = row.region.trim().toUpperCase();
    if (!r || r === "UNKNOWN") return false;
    return !allowed.has(r);
  }).length;

  const threshold = Math.max(3, policy.massOffRegionThreshold);
  if (offRegionHits < threshold) return;

  const until = new Date(Date.now() + Math.max(5, policy.suspendMinutes) * 60 * 1000);
  await prisma.licenseSuspension.upsert({
    where: { subject },
    create: {
      subject,
      reason: "geofence_mass_off_region",
      until,
    },
    update: {
      until,
      reason: "geofence_mass_off_region",
    },
  });

  await recordSecurityEvent({
    type: "geofence_mass_anomaly",
    severity: SecuritySeverity.CRITICAL,
    title: "Geofencing: mass off-region access — license temporarily suspended",
    detail: `subject=${subject}; offRegionHits=${offRegionHits}; windowMinutes=${policy.anomalyWindowMinutes}; threshold=${threshold}`,
    requestPath: "/api/auth",
    requestId: null,
    region: null,
  });
}
