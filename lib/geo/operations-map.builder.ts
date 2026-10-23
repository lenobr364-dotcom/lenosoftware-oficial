import { prisma } from "@/lib/prisma";
import { NEXUS_HQ } from "@/lib/nexus-legal-identity";
import { loadAllIngestedPoints } from "@/lib/geo/geo-ingest-store";
import { regionLabelForLocale } from "@/lib/geo/region-labels";
import {
  countryFromFreeText,
  HQ_COORDINATE,
  jitterCoordinate,
  resolveCountryCentroid,
} from "@/lib/geo/region-centroids";
import type {
  OperationsMapBounds,
  OperationsMapPayload,
  OperationsMapPoint,
} from "@/lib/geo/types";

function computeBounds(points: OperationsMapPoint[]): OperationsMapBounds {
  if (points.length === 0) {
    return { minLat: -35, maxLat: 15, minLng: -75, maxLng: -35 };
  }
  let minLat = points[0]!.lat;
  let maxLat = points[0]!.lat;
  let minLng = points[0]!.lng;
  let maxLng = points[0]!.lng;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  const pad = 2;
  return {
    minLat: minLat - pad,
    maxLat: maxLat + pad,
    minLng: minLng - pad,
    maxLng: maxLng + pad,
  };
}

export async function buildOperationsMapPayload(localeInput?: string | null): Promise<OperationsMapPayload> {
  const locale = localeInput ?? "en";
  const points: OperationsMapPoint[] = [];

  points.push({
    id: "hq-matriz",
    kind: "hq",
    lat: HQ_COORDINATE.lat,
    lng: HQ_COORDINATE.lng,
    label: regionLabelForLocale(locale, "hq"),
    regionLabel: `${NEXUS_HQ.city}, ${NEXUS_HQ.state}`,
    meta: { status: "SEALED" },
  });

  const [licenses, activityGroups, requests, usageRows, ingested] = await Promise.all([
    prisma.formulaIndustrialLicense.findMany({
      where: { status: "ACTIVE", validUntil: { gt: new Date() } },
      take: 120,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientSubject: true,
        formulaCode: true,
        validUntil: true,
      },
    }),
    prisma.licenseActivity.groupBy({
      by: ["region"],
      _count: { _all: true },
    }),
    prisma.licenseRequest.findMany({
      where: { status: "Pendente" },
      take: 40,
      orderBy: { createdAt: "desc" },
      select: { id: true, company: true, country: true },
    }),
    prisma.formulaUsageDaily.findMany({
      where: {
        day: new Date().toISOString().slice(0, 10),
      },
      orderBy: { count: "desc" },
      take: 30,
    }),
    loadAllIngestedPoints(),
  ]);

  for (const lic of licenses) {
    const country = countryFromFreeText(lic.clientSubject);
    const base = resolveCountryCentroid(country);
    const { lat, lng } = jitterCoordinate(base.lat, base.lng, lic.id, 0.9);
    points.push({
      id: `lic-${lic.id}`,
      kind: "license",
      lat,
      lng,
      label: lic.formulaCode,
      regionLabel: regionLabelForLocale(locale, country),
      meta: {
        formulaCode: lic.formulaCode,
        clientSubject: lic.clientSubject,
        status: "ACTIVE",
      },
    });
  }

  const activities = activityGroups
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 24);

  for (const row of activities) {
    const region = row.region || "unknown";
    const base = resolveCountryCentroid(region);
    const { lat, lng } = jitterCoordinate(base.lat, base.lng, `act-${region}`, 1.4);
    points.push({
      id: `act-${region}`,
      kind: "activity",
      lat,
      lng,
      label: regionLabelForLocale(locale, region),
      regionLabel: regionLabelForLocale(locale, region),
      meta: { count: row._count._all },
    });
  }

  for (const req of requests) {
    const country = countryFromFreeText(req.country);
    const base = resolveCountryCentroid(country);
    const { lat, lng } = jitterCoordinate(base.lat, base.lng, req.id, 1.1);
    points.push({
      id: `req-${req.id}`,
      kind: "request",
      lat,
      lng,
      label: req.company,
      regionLabel: regionLabelForLocale(locale, country),
      meta: { country: req.country, status: "Pendente" },
    });
  }

  for (const usage of usageRows) {
    const base = resolveCountryCentroid("latam");
    const { lat, lng } = jitterCoordinate(base.lat, base.lng, usage.formulaKey, 0.7);
    points.push({
      id: `app-${usage.formulaKey}-${usage.day}`,
      kind: "application",
      lat,
      lng,
      label: usage.formulaKey,
      regionLabel: regionLabelForLocale(locale, "latam"),
      meta: { count: usage.count },
    });
  }

  for (const geo of ingested) {
    points.push({
      id: `imp-${geo.id}`,
      kind: "imported",
      lat: geo.lat,
      lng: geo.lng,
      label: geo.label ?? geo.sourceTag ?? "SIRGAS/UTM",
      regionLabel: regionLabelForLocale(locale, "latam"),
      meta: { status: String(geo.crs) },
    });
  }

  const bounds = computeBounds(points);
  const center = {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };

  const layers = {
    hq: points.filter((p) => p.kind === "hq").length,
    license: points.filter((p) => p.kind === "license").length,
    application: points.filter((p) => p.kind === "application").length,
    imported: points.filter((p) => p.kind === "imported").length,
    activity: points.filter((p) => p.kind === "activity").length,
    request: points.filter((p) => p.kind === "request").length,
  };

  const { listGeoIngests } = await import("@/lib/geo/geo-ingest-store");
  const catalog = await listGeoIngests();

  return {
    locale,
    updatedAt: new Date().toISOString(),
    bounds,
    center,
    points,
    layers,
    ingestCatalog: catalog.map((c) => ({
      id: c.id,
      fileName: c.fileName,
      pointCount: c.points.length,
      ingestedAt: c.ingestedAt,
    })),
  };
}
