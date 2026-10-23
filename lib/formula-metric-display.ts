import { kgToPounds, litersToUsGallons, usesImperialDisplay } from "@/lib/market-scalability-fx";

function parseDecimalToken(raw: string): number {
  const t = String(raw).replace(",", ".");
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : NaN;
}

function fmtImperial(n: number, maxDecimals: number): string {
  if (!Number.isFinite(n)) return String(n);
  const f = maxDecimals;
  const s = n.toFixed(f);
  return s.replace(/\.?0+$/, "").replace(/\.$/, "") || "0";
}

/**
 * Converte ocorrências de litros/L e kg no texto livre para galões US e libras
 * quando o locale é `en` ou `hi` (visualização; o armazém permanece métrico).
 */
export function convertMetricPhrasesInText(text: string, locale: string): string {
  if (!text || !usesImperialDisplay(locale)) return text;

  let s = text;

  s = s.replace(/\b(\d+(?:[.,]\d+)?)\s*(?:litros?|litres?)\b/gi, (_, num: string) => {
    const v = parseDecimalToken(num);
    if (!Number.isFinite(v)) return _;
    const gal = litersToUsGallons(v);
    return `${fmtImperial(gal, 2)} US gal`;
  });

  s = s.replace(/\b(\d+(?:[.,]\d+)?)\s+L\b/gi, (_, num: string) => {
    const v = parseDecimalToken(num);
    if (!Number.isFinite(v)) return _;
    const gal = litersToUsGallons(v);
    return `${fmtImperial(gal, 2)} US gal`;
  });

  s = s.replace(/(\d+(?:[.,]\d+)?)L\b/gi, (match, num: string) => {
    const v = parseDecimalToken(num);
    if (!Number.isFinite(v)) return match;
    const gal = litersToUsGallons(v);
    return `${fmtImperial(gal, 2)} US gal`;
  });

  s = s.replace(/\b(\d+(?:[.,]\d+)?)\s*kg\b/gi, (_, num: string) => {
    const v = parseDecimalToken(num);
    if (!Number.isFinite(v)) return _;
    const lb = kgToPounds(v);
    return `${fmtImperial(lb, 2)} lb`;
  });

  return s;
}
