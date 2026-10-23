import { NEXUS_HQ } from "@/lib/nexus-legal-identity";

/** HQ Barra do Garças — referência operacional. */
export const HQ_COORDINATE = {
  lat: -15.8942,
  lng: -52.2566,
  city: NEXUS_HQ.city,
  cep: NEXUS_HQ.cep,
};

const COUNTRY: Record<string, { lat: number; lng: number }> = {
  BR: { lat: -14.235, lng: -51.9253 },
  US: { lat: 37.0902, lng: -95.7129 },
  CA: { lat: 56.1304, lng: -106.3468 },
  MX: { lat: 23.6345, lng: -102.5528 },
  AR: { lat: -38.4161, lng: -63.6167 },
  DE: { lat: 51.1657, lng: 10.4515 },
  FR: { lat: 46.2276, lng: 2.2137 },
  GB: { lat: 55.3781, lng: -3.436 },
  ES: { lat: 40.4637, lng: -3.7492 },
  PT: { lat: 39.3999, lng: -8.2245 },
  IN: { lat: 20.5937, lng: 78.9629 },
  CN: { lat: 35.8617, lng: 104.1954 },
  AE: { lat: 23.4241, lng: 53.8478 },
  SA: { lat: 23.8859, lng: 45.0792 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  AU: { lat: -25.2744, lng: 133.7751 },
  unknown: { lat: 0, lng: 0 },
};

const REGION: Record<string, { lat: number; lng: number }> = {
  latam: { lat: -10, lng: -55 },
  americas: { lat: 15, lng: -90 },
  europe: { lat: 50, lng: 10 },
  asia: { lat: 22, lng: 105 },
  mena: { lat: 28, lng: 45 },
  unknown: { lat: 0, lng: 20 },
};

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function jitterCoordinate(
  lat: number,
  lng: number,
  seed: string,
  spreadDeg = 1.2,
): { lat: number; lng: number } {
  const h = hashSeed(seed);
  const a = (h % 10_000) / 10_000 - 0.5;
  const b = ((h >> 12) % 10_000) / 10_000 - 0.5;
  return { lat: lat + a * spreadDeg, lng: lng + b * spreadDeg };
}

export function resolveCountryCentroid(countryOrRegion: string): { lat: number; lng: number } {
  const key = countryOrRegion.trim().toUpperCase();
  if (key.length === 2 && COUNTRY[key]) return COUNTRY[key]!;
  const regionKey = countryOrRegion.toLowerCase();
  if (REGION[regionKey]) return REGION[regionKey]!;
  if (COUNTRY[key.slice(0, 2)]) return COUNTRY[key.slice(0, 2)]!;
  return REGION.unknown;
}

export function countryFromFreeText(text: string): string {
  const t = text.trim().toLowerCase();
  if (t.includes("brasil") || t === "brazil" || t === "br") return "BR";
  if (t.includes("united states") || t === "usa" || t === "us") return "US";
  if (t.includes("deutsch") || t === "germany" || t === "de") return "DE";
  if (t.includes("india") || t === "in") return "IN";
  if (t.includes("emirates") || t === "ae") return "AE";
  return "unknown";
}
