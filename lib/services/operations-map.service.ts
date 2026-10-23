import { buildOperationsMapPayload } from "@/lib/geo/operations-map.builder";
import { parseSirgasUtmXml } from "@/lib/geo/sirgas-utm-parser";
import { saveGeoIngest } from "@/lib/geo/geo-ingest-store";
import type { GeoIngestResult } from "@/lib/geo/types";

export async function getLiveOperationsMap(locale?: string | null) {
  return buildOperationsMapPayload(locale);
}

export async function ingestGeographicXml(
  fileName: string,
  xml: string,
): Promise<GeoIngestResult> {
  const parsed = parseSirgasUtmXml(xml);
  const stored = await saveGeoIngest(fileName, {
    crsDetected: parsed.crsDetected,
    points: parsed.points,
    warnings: parsed.warnings,
  });

  return {
    id: stored.id,
    fileName: stored.fileName,
    format: "xml",
    crsDetected: stored.crsDetected,
    pointCount: stored.points.length,
    warnings: stored.warnings,
    ingestedAt: stored.ingestedAt,
  };
}
