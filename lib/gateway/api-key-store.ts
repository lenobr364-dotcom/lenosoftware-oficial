import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  formatApiKey,
  generateKeyId,
  generateKeySecret,
  hashApiKeySecret,
  keyPrefix,
} from "@/lib/gateway/api-key-crypto";
import type { ApiKeyCreateResult, ApiKeyPublicRow, ApiKeyRecord, ApiKeyScope, ApiKeyStatus } from "@/lib/gateway/types";

const DEFAULT_SCOPES: ApiKeyScope[] = ["read:health", "read:openapi", "read:formulas", "read:analytics"];

function storePath(): string {
  return path.join(process.cwd(), "chemvault-public", "api-gateway", "keys.json");
}

type StoreFile = { keys: ApiKeyRecord[] };

let cache: StoreFile | null = null;

async function loadStore(): Promise<StoreFile> {
  if (cache) return cache;
  try {
    const raw = await readFile(storePath(), "utf8");
    cache = JSON.parse(raw) as StoreFile;
  } catch {
    cache = { keys: [] };
  }
  return cache!;
}

async function saveStore(data: StoreFile): Promise<void> {
  cache = data;
  const dir = path.dirname(storePath());
  await mkdir(dir, { recursive: true });
  await writeFile(storePath(), JSON.stringify(data, null, 2), "utf8");
}

export function toPublicRow(record: ApiKeyRecord): ApiKeyPublicRow {
  return {
    id: record.id,
    label: record.label,
    prefix: record.prefix,
    scopes: record.scopes,
    status: record.status,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt,
    lastUsedAt: record.lastUsedAt,
    requestCount: record.requestCount,
  };
}

export async function listApiKeysForSubject(subject: string): Promise<ApiKeyPublicRow[]> {
  const store = await loadStore();
  return store.keys.filter((k) => k.subject === subject).map(toPublicRow);
}

export async function findApiKeyById(keyId: string): Promise<ApiKeyRecord | null> {
  const store = await loadStore();
  return store.keys.find((k) => k.id === keyId) ?? null;
}

export async function createApiKey(
  subject: string,
  label: string,
  scopes?: ApiKeyScope[],
): Promise<ApiKeyCreateResult> {
  const store = await loadStore();
  const id = generateKeyId();
  const secret = generateKeySecret();
  const now = new Date().toISOString();
  const record: ApiKeyRecord = {
    id,
    label: label.trim() || "Integration key",
    prefix: keyPrefix(id),
    secretHash: hashApiKeySecret(secret),
    subject,
    scopes: scopes?.length ? scopes : DEFAULT_SCOPES,
    status: "active",
    createdAt: now,
    revokedAt: null,
    lastUsedAt: null,
    requestCount: 0,
  };
  store.keys.push(record);
  await saveStore(store);
  return { key: toPublicRow(record), secret: formatApiKey(id, secret) };
}

export async function revokeApiKey(keyId: string, subject: string): Promise<ApiKeyPublicRow | null> {
  const store = await loadStore();
  const idx = store.keys.findIndex((k) => k.id === keyId && k.subject === subject);
  if (idx < 0) return null;
  const row = store.keys[idx]!;
  if (row.status === "revoked") return toPublicRow(row);
  row.status = "revoked" as ApiKeyStatus;
  row.revokedAt = new Date().toISOString();
  store.keys[idx] = row;
  await saveStore(store);
  return toPublicRow(row);
}

export async function touchApiKeyUsage(keyId: string): Promise<void> {
  const store = await loadStore();
  const idx = store.keys.findIndex((k) => k.id === keyId);
  if (idx < 0) return;
  const row = store.keys[idx]!;
  row.lastUsedAt = new Date().toISOString();
  row.requestCount += 1;
  store.keys[idx] = row;
  await saveStore(store);
}

export async function getActiveKeyRecord(keyId: string): Promise<ApiKeyRecord | null> {
  const store = await loadStore();
  const row = store.keys.find((k) => k.id === keyId && k.status === "active");
  return row ?? null;
}
