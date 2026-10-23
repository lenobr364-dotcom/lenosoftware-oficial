import { prisma } from "@/lib/prisma";

export type LicenseTrendPoint = { day: string; requests: number };

/** Últimos 30 dias (UTC), contagens diárias de pedidos de licença (`LicenseRequest`). */
export async function getLicenseRequestTrend30d(): Promise<LicenseTrendPoint[]> {
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const t = new Date(anchor);
    t.setUTCDate(anchor.getUTCDate() - i);
    days.push(t.toISOString().slice(0, 10));
  }

  const since = `${days[0]}T00:00:00.000Z`;
  const requests = await prisma.licenseRequest.findMany({
    where: { createdAt: { gte: new Date(since) } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const d of days) counts.set(d, 0);
  for (const r of requests) {
    const key = r.createdAt.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return days.map((day) => ({ day, requests: counts.get(day) ?? 0 }));
}
