/**
 * Parser de XML geográfico — padrões SIRGAS/UTM, GML pos, KML coordinates.
 */

import { randomUUID } from "crypto";

import type { GeoCrsHint, ParsedGeoRecord } from "@/lib/geo/types";
import { isPlausibleLatLng, isPlausibleUtm, parseUtmZone, utmToWgs84 } from "@/lib/geo/utm";

export type SirgasParseResult = {
  points: ParsedGeoRecord[];
  crsDetected: GeoCrsHint;
  warnings: string[];
};

function detectCrs(xml: string): GeoCrsHint {
  const lower = xml.toLowerCase();
  if (lower.includes("sirgas") || lower.includes("2000")) return "SIRGAS2000";
  if (lower.includes("utm") || lower.includes("easting") || lower.includes("northing")) return "UTM";
  if (lower.includes("wgs84") || lower.includes("epsg:4326")) return "WGS84";
  return "unknown";
}

function pushUnique(
  out: ParsedGeoRecord[],
  point: Omit<ParsedGeoRecord, "id">,
): void {
  if (!isPlausibleLatLng(point.lat, point.lng)) return;
  const dup = out.some((p) => Math.abs(p.lat - point.lat) < 1e-6 && Math.abs(p.lng - point.lng) < 1e-6);
  if (dup) return;
  out.push({ id: randomUUID(), ...point });
}

/** KML: lon,lat[,alt] ou lat,lon em <coordinates>. */
function parseKmlCoordinates(xml: string, warnings: string[]): ParsedGeoRecord[] {
  const out: ParsedGeoRecord[] = [];
  const re = /<coordinates[^>]*>([\s\S]*?)<\/coordinates>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const block = match[1]!.trim();
    const tuples = block.split(/\s+/).filter(Boolean);
    for (const tuple of tuples) {
      const parts = tuple.split(",").map((s) => Number.parseFloat(s.trim()));
      if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) continue;
      let lat = parts[1]!;
      let lng = parts[0]!;
      if (Math.abs(lat) > 90 && Math.abs(parts[0]!) <= 90) {
        lat = parts[0]!;
        lng = parts[1]!;
        warnings.push("kml_coordinate_order_swapped");
      }
      pushUnique(out, { lat, lng, crs: "WGS84", sourceTag: "kml:coordinates" });
    }
  }
  return out;
}

/** GML <pos>lat lng</pos> ou <pos>lng lat</pos>. */
function parseGmlPos(xml: string): ParsedGeoRecord[] {
  const out: ParsedGeoRecord[] = [];
  const re = /<pos[^>]*>([^<]+)<\/pos>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const nums = match[1]!
      .trim()
      .split(/\s+/)
      .map((s) => Number.parseFloat(s));
    if (nums.length < 2 || nums.some((n) => !Number.isFinite(n))) continue;
    const a = nums[0]!;
    const b = nums[1]!;
    let lat = a;
    let lng = b;
    if (Math.abs(a) > 90) {
      lng = a;
      lat = b;
    }
    pushUnique(out, { lat, lng, crs: "SIRGAS2000", sourceTag: "gml:pos" });
  }
  return out;
}

/** Blocos UTM em XML customizado / metadados de campo. */
function parseUtmBlocks(xml: string, warnings: string[]): ParsedGeoRecord[] {
  const out: ParsedGeoRecord[] = [];
  const blockRe =
    /<(?:point|pto|location|coordenada|utm)[^>]*>([\s\S]*?)<\/(?:point|pto|location|coordenada|utm)>/gi;
  let block: RegExpExecArray | null;

  const globalZone =
    xml.match(/<(?:utmZone|zone|fuso)[^>]*>([^<]+)<\//i)?.[1] ??
    xml.match(/<zone>(\d{1,2}[NS]?)<\/zone>/i)?.[1];

  const parseNumbers = (chunk: string) => {
    const easting = Number.parseFloat(
      chunk.match(/<(?:easting|east|e)[^>]*>([^<]+)</i)?.[1] ??
        chunk.match(/easting[=:"'\s]+([0-9.]+)/i)?.[1] ??
        "",
    );
    const northing = Number.parseFloat(
      chunk.match(/<(?:northing|north|n)[^>]*>([^<]+)</i)?.[1] ??
        chunk.match(/northing[=:"'\s]+([0-9.]+)/i)?.[1] ??
        "",
    );
    const zoneRaw =
      chunk.match(/<(?:zone|fuso|utmZone)[^>]*>([^<]+)</i)?.[1] ?? globalZone ?? "22S";
    return { easting, northing, zoneRaw };
  };

  while ((block = blockRe.exec(xml)) !== null) {
    const chunk = block[1]!;
    const { easting, northing, zoneRaw } = parseNumbers(chunk);
    if (!isPlausibleUtm(easting, northing)) continue;
    const z = parseUtmZone(zoneRaw.replace(/\s/g, "")) ?? { zone: 22, hemisphere: "S" as const };
    const { lat, lng } = utmToWgs84(easting, northing, z.zone, z.hemisphere);
    pushUnique(out, {
      lat,
      lng,
      crs: "UTM",
      zone: z.zone,
      hemisphere: z.hemisphere,
      sourceTag: "xml:utm-block",
    });
  }

  const pairRe =
    /easting[=:"'\s]+([0-9.]+)[\s\S]{0,120}?northing[=:"'\s]+([0-9.]+)(?:[\s\S]{0,80}?zone[=:"'\s]+(\d{1,2}[NS]?))?/gi;
  let pair: RegExpExecArray | null;
  while ((pair = pairRe.exec(xml)) !== null) {
    const easting = Number.parseFloat(pair[1]!);
    const northing = Number.parseFloat(pair[2]!);
    if (!isPlausibleUtm(easting, northing)) continue;
    const z = parseUtmZone(pair[3] ?? globalZone ?? "22S") ?? { zone: 22, hemisphere: "S" as const };
    const { lat, lng } = utmToWgs84(easting, northing, z.zone, z.hemisphere);
    pushUnique(out, {
      lat,
      lng,
      crs: "UTM",
      zone: z.zone,
      hemisphere: z.hemisphere,
      sourceTag: "xml:utm-pair",
    });
  }

  if (out.length === 0 && warnings.length === 0) {
    warnings.push("utm_blocks_not_found");
  }

  return out;
}

/**
 * Processa XML geográfico (SIRGAS2000 / UTM / KML / GML).
 */
export function parseSirgasUtmXml(xml: string): SirgasParseResult {
  const warnings: string[] = [];
  const crsDetected = detectCrs(xml);
  const points: ParsedGeoRecord[] = [];

  for (const p of parseKmlCoordinates(xml, warnings)) points.push(p);
  for (const p of parseGmlPos(xml)) points.push(p);
  for (const p of parseUtmBlocks(xml, warnings)) points.push(p);

  if (points.length === 0) {
    warnings.push("no_coordinates_extracted");
  }

  return { points, crsDetected, warnings };
}
