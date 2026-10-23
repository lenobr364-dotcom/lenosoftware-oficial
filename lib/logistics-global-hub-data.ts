/**
 * Parâmetros ilustrativos para o hub logístico (estratégico / não contratual).
 * Origem notional: hub de consolidação BIJU (Oceano Índico / Médio Oriente).
 */

export type LogisticsPortId = "santos_br" | "mumbai_in" | "dubai_uae" | "hamburg_de";

export type LogisticsPortMeta = {
  id: LogisticsPortId;
  /** Dias marítimos centrais (rota ilustrativa) */
  seaDaysCenter: number;
  /** Meia-amplitude do intervalo exibido (±dias) */
  seaDaysSpread: number;
  /** USD por tonelada métrica — frete marítimo indicativo */
  freightUsdPerMt: number;
  /** Imposto de importação aproximado (%) para cálculo educativo */
  importDutyApproxPct: number;
  /** Chave i18n do país (LogisticsGlobalHub.country_*) */
  countryI18nKey: "br" | "in" | "ae" | "de";
  /** Posição no mapa decorativo (viewBox 0–1000 × 0–420) */
  map: { x: number; y: number };
};

export const LOGISTICS_PORTS: LogisticsPortMeta[] = [
  {
    id: "santos_br",
    seaDaysCenter: 38,
    seaDaysSpread: 5,
    freightUsdPerMt: 128,
    importDutyApproxPct: 14,
    countryI18nKey: "br",
    map: { x: 318, y: 332 },
  },
  {
    id: "mumbai_in",
    seaDaysCenter: 11,
    seaDaysSpread: 3,
    freightUsdPerMt: 74,
    importDutyApproxPct: 10.5,
    countryI18nKey: "in",
    map: { x: 628, y: 248 },
  },
  {
    id: "dubai_uae",
    seaDaysCenter: 5,
    seaDaysSpread: 2,
    freightUsdPerMt: 56,
    importDutyApproxPct: 5,
    countryI18nKey: "ae",
    map: { x: 598, y: 252 },
  },
  {
    id: "hamburg_de",
    seaDaysCenter: 21,
    seaDaysSpread: 4,
    freightUsdPerMt: 98,
    importDutyApproxPct: 7.5,
    countryI18nKey: "de",
    map: { x: 498, y: 168 },
  },
];

export const LOGISTICS_PORT_IDS = LOGISTICS_PORTS.map((p) => p.id);

export function getLogisticsPort(id: LogisticsPortId): LogisticsPortMeta | undefined {
  return LOGISTICS_PORTS.find((p) => p.id === id);
}

/** Ajuste leve do frete em função da massa (economias de escala ilustrativas). */
export function freightMultiplierForMt(mt: number): number {
  const m = Math.min(Math.max(mt, 5), 200);
  if (m <= 20) return 1.06 - (m / 20) * 0.06;
  return 1 - Math.min(0.12, (m - 20) * 0.0008);
}

export function transitDayRange(port: LogisticsPortMeta, cargoMt: number): { min: number; max: number } {
  const cargoAdj = Math.floor(Math.min(18, cargoMt / 8));
  const min = Math.max(4, port.seaDaysCenter - port.seaDaysSpread + Math.floor(cargoAdj / 3));
  const max = port.seaDaysCenter + port.seaDaysSpread + cargoAdj;
  return { min, max: Math.max(min + 2, max) };
}
