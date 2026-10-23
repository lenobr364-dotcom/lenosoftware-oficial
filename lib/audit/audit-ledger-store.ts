import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { AuditLedgerEntry } from "@/lib/audit/types";

const MAX_EVENTS = 2_000;

function storePath(): string {
  return path.join(process.cwd(), "chemvault-public", "audit-ledger", "events.json");
}

type StoreFile = { events: AuditLedgerEntry[] };

let cache: StoreFile | null = null;
let cacheAt = 0;
const CACHE_MS = 2_500;

async function loadStore(): Promise<StoreFile> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) return cache;
  try {
    const raw = await readFile(storePath(), "utf8");
    cache = JSON.parse(raw) as StoreFile;
  } catch {
    cache = { events: [] };
  }
  cacheAt = now;
  return cache!;
}

async function saveStore(data: StoreFile): Promise<void> {
  cache = data;
  cacheAt = Date.now();
  const dir = path.dirname(storePath());
  await mkdir(dir, { recursive: true });
  await writeFile(storePath(), JSON.stringify(data, null, 2), "utf8");
}

export function invalidateAuditCache(): void {
  cache = null;
  cacheAt = 0;
}

export async function appendAuditLedgerEntry(
  entry: Omit<AuditLedgerEntry, "id" | "at"> & { id?: string; at?: string },
): Promise<AuditLedgerEntry> {
  const store = await loadStore();
  const row: AuditLedgerEntry = {
    id: entry.id ?? `aud_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    at: entry.at ?? new Date().toISOString(),
    category: entry.category,
    severity: entry.severity,
    outcome: entry.outcome,
    actorHint: entry.actorHint,
    resource: entry.resource,
    region: entry.region ?? null,
    messageKey: entry.messageKey,
    messageParams: entry.messageParams,
    requestPath: entry.requestPath ?? null,
  };
  store.events.unshift(row);
  if (store.events.length > MAX_EVENTS) store.events.length = MAX_EVENTS;
  await saveStore(store);
  return row;
}

export async function listAuditLedgerEntries(): Promise<AuditLedgerEntry[]> {
  const store = await loadStore();
  return store.events;
}
