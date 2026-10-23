import { NextRequest, NextResponse } from "next/server";

import { computeAdminBillingSnapshot } from "@/lib/admin-billing-snapshot";
import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export type AdminSummaryResponse = {
  ok: true;
  windowHours: number;
  licensesByRegion: { region: string; count: number }[];
  licensePulseLast24h: number;
  formulaUsageByDay: { day: string; totalViews: number }[];
  securityBySeverity: { severity: string; count: number }[];
  billing: {
    activeLicenseTokens30d: number;
    approvedDealsByCurrency: { currencyCode: string; count: number }[];
    projectedAnnualRevenueByCurrency: { currencyCode: string; amount: number }[];
  };
};

export async function GET(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [byRegion, pulse24, usageAgg, secAgg, billing] = await Promise.all([
    prisma.licenseActivity.groupBy({
      by: ["region"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.licenseActivity.count({ where: { createdAt: { gte: since } } }),
    prisma.formulaUsageDaily.groupBy({
      by: ["day"],
      where: { day: { gte: dayCutoff } },
      _sum: { count: true },
      orderBy: { day: "asc" },
    }),
    prisma.securityEvent.groupBy({
      by: ["severity"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    computeAdminBillingSnapshot(),
  ]);

  const body: AdminSummaryResponse = {
    ok: true,
    windowHours: 24,
    licensesByRegion: byRegion.map((r) => ({
      region: r.region,
      count: r._count._all,
    })),
    licensePulseLast24h: pulse24,
    formulaUsageByDay: usageAgg.map((u) => ({
      day: u.day,
      totalViews: u._sum.count ?? 0,
    })),
    securityBySeverity: secAgg.map((s) => ({
      severity: s.severity,
      count: s._count._all,
    })),
    billing: {
      activeLicenseTokens30d: billing.activeLicenseTokens30d,
      approvedDealsByCurrency: billing.approvedDealsByCurrency,
      projectedAnnualRevenueByCurrency: billing.projectedAnnualRevenueByCurrency,
    },
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "private, max-age=0, must-revalidate" },
  });
}
