import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { GatewayAccessLogEntry } from "@/lib/gateway/types";

const MAX_LOGS = 500;

function storePath(): string {
  return path.join(process.cwd(), "chemvault-public", "api-gateway", "access-logs.json");
}

type StoreFile = { logs: GatewayAccessLogEntry[] };

let cache: StoreFile | null = null;

async function loadStore(): Promise<StoreFile> {
  if (cache) return cache;
  try {
    const raw = await readFile(storePath(), "utf8");
    cache = JSON.parse(raw) as StoreFile;
  } catch {
    cache = { logs: [] };
  }
  return cache!;
}

async function saveStore(data: StoreFile): Promise<void> {
  cache = data;
  const dir = path.dirname(storePath());
  await mkdir(dir, { recursive: true });
  await writeFile(storePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function appendAccessLog(
  entry: Omit<GatewayAccessLogEntry, "id" | "at"> & { at?: string },
): Promise<GatewayAccessLogEntry> {
  const store = await loadStore();
  const row: GatewayAccessLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    at: entry.at ?? new Date().toISOString(),
    keyId: entry.keyId,
    keyPrefix: entry.keyPrefix,
    method: entry.method,
    path: entry.path,
    status: entry.status,
    latencyMs: entry.latencyMs,
    ipHint: entry.ipHint,
  };
  store.logs.unshift(row);
  if (store.logs.length > MAX_LOGS) store.logs.length = MAX_LOGS;
  await saveStore(store);
  return row;
}

export async function listAccessLogs(opts?: {
  keyId?: string;
  subjectKeyIds?: string[];
  limit?: number;
}): Promise<GatewayAccessLogEntry[]> {
  const store = await loadStore();
  let rows = store.logs;
  if (opts?.keyId) rows = rows.filter((l) => l.keyId === opts.keyId);
  if (opts?.subjectKeyIds?.length) {
    const set = new Set(opts.subjectKeyIds);
    rows = rows.filter((l) => set.has(l.keyId));
  }
  const limit = opts?.limit ?? 80;
  return rows.slice(0, limit);
}

export function computeLogStats(logs: GatewayAccessLogEntry[]): {
  requests24h: number;
  avgLatencyMs: number;
} {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recent = logs.filter((l) => new Date(l.at).getTime() >= since);
  const avgLatencyMs =
    recent.length === 0 ? 0 : Math.round(recent.reduce((s, l) => s + l.latencyMs, 0) / recent.length);
  return { requests24h: recent.length, avgLatencyMs };
}
