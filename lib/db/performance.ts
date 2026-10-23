/**
 * Instrumentação de consultas — latência e cache leve em memória.
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const queryCache = new Map<string, CacheEntry<unknown>>();

export async function withQueryTiming<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<{ data: T; durationMs: number; label: string }> {
  const started = performance.now();
  const data = await fn();
  return {
    data,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    label,
  };
}

export async function cachedQuery<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<{ data: T; cacheHit: boolean }> {
  const now = Date.now();
  const hit = queryCache.get(key);
  if (hit && hit.expiresAt > now) {
    return { data: hit.value as T, cacheHit: true };
  }

  const data = await fn();
  queryCache.set(key, { value: data, expiresAt: now + ttlMs });
  return { data, cacheHit: false };
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) queryCache.delete(key);
  }
}
