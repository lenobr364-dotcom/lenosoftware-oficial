import type { PlanTierId } from "@/lib/pricing/plans";

export type SalesPulseEvent = {
  id: string;
  at: number;
  countryIso2: string;
  countryLabel: string;
  plan: PlanTierId;
};

const MAX = 40;
const events: SalesPulseEvent[] = [];
const lastByIp = new Map<string, number>();
const THROTTLE_MS = 25_000;

function countryLabelFromIso(iso: string): string {
  const c = iso.trim().toUpperCase();
  if (!c || c === "UNKNOWN") return "Global";
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(c) ?? c;
  } catch {
    return c;
  }
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordSalesPulse(input: { countryIso2: string; plan: PlanTierId; ipHint: string | null }): SalesPulseEvent | null {
  const ip = input.ipHint?.trim() || "anon";
  const now = Date.now();
  const prev = lastByIp.get(ip) ?? 0;
  if (now - prev < THROTTLE_MS) return null;
  lastByIp.set(ip, now);

  const countryIso2 = input.countryIso2.trim().toUpperCase() || "UNKNOWN";
  const ev: SalesPulseEvent = {
    id: randomId(),
    at: now,
    countryIso2,
    countryLabel: countryLabelFromIso(countryIso2),
    plan: input.plan,
  };
  events.unshift(ev);
  if (events.length > MAX) events.length = MAX;
  return ev;
}

export function readSalesPulseEvents(): SalesPulseEvent[] {
  return [...events];
}
