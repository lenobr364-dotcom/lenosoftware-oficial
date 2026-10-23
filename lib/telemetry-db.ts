import type { SecuritySeverity } from "@prisma/client";

import { notifyAdminCriticalSecurity } from "@/lib/admin-event-notify";
import { prisma } from "@/lib/prisma";
import { dispatchIntrusionWebhook } from "@/lib/webhook-dispatch";

function utcDayString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function recordLicenseActivity(input: {
  subject: string;
  channel: string;
  region: string;
  ip?: string | null;
}): Promise<void> {
  try {
    await prisma.licenseActivity.create({
      data: {
        subject: input.subject.slice(0, 512),
        channel: input.channel.slice(0, 64),
        region: input.region.slice(0, 32),
        ip: input.ip?.slice(0, 64) ?? null,
      },
    });
  } catch {
    // telemetria best-effort
  }
}

export async function recordSecurityEvent(input: {
  type: string;
  severity: SecuritySeverity;
  title: string;
  detail?: string | null;
  requestPath?: string | null;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  region?: string | null;
}): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: input.type.slice(0, 96),
        severity: input.severity,
        title: input.title.slice(0, 256),
        detail: input.detail?.slice(0, 2000) ?? null,
        requestPath: input.requestPath?.slice(0, 512) ?? null,
        requestId: input.requestId?.slice(0, 64) ?? null,
        ip: input.ip?.slice(0, 64) ?? null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
        region: input.region?.slice(0, 32) ?? null,
      },
    });
    dispatchIntrusionWebhook({
      type: input.type.slice(0, 96),
      severity: input.severity,
      title: input.title.slice(0, 256),
      detail: input.detail?.slice(0, 2000) ?? null,
      requestPath: input.requestPath?.slice(0, 512) ?? null,
      requestId: input.requestId?.slice(0, 64) ?? null,
      ip: input.ip?.slice(0, 64) ?? null,
      userAgent: input.userAgent?.slice(0, 512) ?? null,
      region: input.region?.slice(0, 32) ?? null,
    });
    if (input.severity === "CRITICAL") {
      notifyAdminCriticalSecurity({
        type: input.type.slice(0, 96),
        title: input.title.slice(0, 256),
        detail: input.detail?.slice(0, 2000) ?? null,
        requestPath: input.requestPath?.slice(0, 512) ?? null,
        region: input.region?.slice(0, 32) ?? null,
      });
    }
  } catch {
    // best-effort
  }
}

export async function recordFormulaImpressionsBatch(formulaIds: string[]): Promise<void> {
  if (formulaIds.length === 0) return;
  const day = utcDayString();
  try {
    await Promise.all(
      formulaIds.map((id) =>
        prisma.formulaUsageDaily.upsert({
          where: { formulaKey_day: { formulaKey: id, day } },
          create: { formulaKey: id, day, count: 1 },
          update: { count: { increment: 1 } },
        }),
      ),
    );
  } catch {
    // best-effort
  }
}
