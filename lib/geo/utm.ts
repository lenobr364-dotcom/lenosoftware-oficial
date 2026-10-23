/**
 * Conversão UTM → WGS84 (adequado para SIRGAS 2000 em operações brasileiras).
 * Elipsoide WGS84 — diferença SIRGAS2000 vs WGS84 desprezível em mapas operacionais.
 */

const WGS84_A = 6378137;
const WGS84_E2 = 0.00669437999014;
const K0 = 0.9996;

function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

/** UTM (easting/northing metros) → lat/lng graus. */
export function utmToWgs84(
  easting: number,
  northing: number,
  zone: number,
  hemisphere: "N" | "S",
): { lat: number; lng: number } {
  const x = easting - 500000;
  const y = hemisphere === "S" ? northing - 10000000 : northing;

  const ePrime2 = WGS84_E2 / (1 - WGS84_E2);
  const m = y / K0;
  const mu =
    m /
    (WGS84_A *
      (1 - WGS84_E2 / 4 - (3 * WGS84_E2 ** 2) / 64 - (5 * WGS84_E2 ** 3) / 256));

  const e1 = (1 - Math.sqrt(1 - WGS84_E2)) / (1 + Math.sqrt(1 - WGS84_E2));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu);

  const sinPhi = Math.sin(phi1);
  const cosPhi = Math.cos(phi1);
  const tanPhi = Math.tan(phi1);

  const n1 = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinPhi ** 2);
  const t1 = tanPhi ** 2;
  const c1 = ePrime2 * cosPhi ** 2;
  const r1 = (WGS84_A * (1 - WGS84_E2)) / (1 - WGS84_E2 * sinPhi ** 2) ** 1.5;
  const d = x / (n1 * K0);

  const lat =
    phi1 -
    ((n1 * tanPhi) / r1) *
      (d ** 2 / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ePrime2) * d ** 4) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ePrime2 - 3 * c1 ** 2) * d ** 6) /
          720);

  const lng =
    ((d -
      ((1 + 2 * t1 + c1) * d ** 3) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ePrime2 + 24 * t1 ** 2) * d ** 5) / 120) /
      cosPhi) *
      (180 / Math.PI) +
    (zone - 1) * 6 -
    180 +
    3;

  return { lat: radToDeg(lat), lng };
}

export function parseUtmZone(raw: string): { zone: number; hemisphere: "N" | "S" } | null {
  const m = raw.trim().match(/^(\d{1,2})([NS])?$/i);
  if (!m) return null;
  const zone = Number.parseInt(m[1]!, 10);
  if (zone < 1 || zone > 60) return null;
  const hemisphere = (m[2]?.toUpperCase() as "N" | "S" | undefined) ?? "S";
  return { zone, hemisphere };
}

export function isPlausibleLatLng(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function isPlausibleUtm(easting: number, northing: number): boolean {
  return easting >= 100_000 && easting <= 900_000 && northing >= 0 && northing <= 10_500_000;
}
