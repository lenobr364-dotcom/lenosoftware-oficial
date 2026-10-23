/**
 * Repositório — consultas paralelas e projeções mínimas (baixa latência).
 */

import { prisma } from "@/lib/prisma";
import { cachedQuery, withQueryTiming } from "@/lib/db/performance";
import { ensureDatabasePerformancePragmas, pingDatabase } from "@/lib/db/bootstrap";

export type LabDashboardRawStats = {
  totalFormulas: number;
  licensedFormulas: number;
  activeIndustrialLicenses: number;
  pendingLicenseRequests: number;
  impressionsToday: number;
  recentLicenses: Array<{
    id: string;
    clientSubject: string;
    formulaCode: string;
    validUntil: Date;
    createdAt: Date;
  }>;
  queryTimings: Array<{ label: string; durationMs: number }>;
  dbPingMs: number;
};

function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchLabDashboardRawStats(): Promise<LabDashboardRawStats> {
  await ensureDatabasePerformancePragmas();

  const timings: Array<{ label: string; durationMs: number }> = [];

  const { data: cached, cacheHit } = await cachedQuery("lab-dashboard-stats-v1", 15_000, async () => {
    const [
      totalFormulasR,
      licensedFormulasR,
      activeLicensesR,
      pendingRequestsR,
      impressionsR,
      recentLicensesR,
    ] = await Promise.all([
      withQueryTiming("formula.count", () => prisma.formula.count()),
      withQueryTiming("formula.licensed", () => prisma.formula.count({ where: { licenciada: true } })),
      withQueryTiming("license.active", () =>
        prisma.formulaIndustrialLicense.count({
          where: { status: "ACTIVE", validUntil: { gt: new Date() } },
        }),
      ),
      withQueryTiming("licenseRequest.pending", () =>
        prisma.licenseRequest.count({ where: { status: "Pendente" } }),
      ),
      withQueryTiming("usage.today", () =>
        prisma.formulaUsageDaily.aggregate({
          where: { day: todayUtcKey() },
          _sum: { count: true },
        }),
      ),
      withQueryTiming("license.recent", () =>
        prisma.formulaIndustrialLicense.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            clientSubject: true,
            formulaCode: true,
            validUntil: true,
            createdAt: true,
          },
        }),
      ),
    ]);

    for (const block of [
      totalFormulasR,
      licensedFormulasR,
      activeLicensesR,
      pendingRequestsR,
      impressionsR,
      recentLicensesR,
    ]) {
      timings.push({ label: block.label, durationMs: block.durationMs });
    }

    return {
      totalFormulas: totalFormulasR.data,
      licensedFormulas: licensedFormulasR.data,
      activeIndustrialLicenses: activeLicensesR.data,
      pendingLicenseRequests: pendingRequestsR.data,
      impressionsToday: impressionsR.data._sum.count ?? 0,
      recentLicenses: recentLicensesR.data,
      queryTimings: timings,
    };
  });

  const dbPingMs = await pingDatabase();

  return {
    ...cached,
    queryTimings: cacheHit
      ? [{ label: "cache", durationMs: 0 }, ...cached.queryTimings]
      : cached.queryTimings,
    dbPingMs,
  };
}
