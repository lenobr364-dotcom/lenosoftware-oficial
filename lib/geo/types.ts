/**
 * Tipos do módulo de geolocalização inteligente (SIRGAS / UTM / operações).
 */

export type GeoCrsHint = "WGS84" | "SIRGAS2000" | "UTM" | "unknown";

export type MapPointKind = "hq" | "license" | "application" | "imported" | "activity" | "request";

export type GeoCoordinate = {
  lat: number;
  lng: number;
};

export type ParsedGeoRecord = GeoCoordinate & {
  id: string;
  crs: GeoCrsHint;
  zone?: number;
  hemisphere?: "N" | "S";
  label?: string;
  sourceTag?: string;
};

export type OperationsMapPoint = {
  id: string;
  kind: MapPointKind;
  lat: number;
  lng: number;
  label: string;
  regionLabel: string;
  meta?: {
    formulaCode?: string;
    clientSubject?: string;
    count?: number;
    status?: string;
    country?: string;
  };
};

export type OperationsMapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type GeoIngestResult = {
  id: string;
  fileName: string;
  format: "xml" | "unknown";
  crsDetected: GeoCrsHint;
  pointCount: number;
  warnings: string[];
  ingestedAt: string;
};

export type OperationsMapPayload = {
  locale: string;
  updatedAt: string;
  bounds: OperationsMapBounds;
  center: GeoCoordinate;
  points: OperationsMapPoint[];
  layers: {
    hq: number;
    license: number;
    application: number;
    imported: number;
    activity: number;
    request: number;
  };
  ingestCatalog: Array<{
    id: string;
    fileName: string;
    pointCount: number;
    ingestedAt: string;
  }>;
};
