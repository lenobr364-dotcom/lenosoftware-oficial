/**
 * Políticas de cache HTTP — laboratório e APIs sensíveis.
 */

export const CACHE = {
  /** APIs privadas do lab — snapshot curto com SWR na borda do browser. */
  privateLab: "private, max-age=10, stale-while-revalidate=30",
  /** Inteligência — atualização mais frequente. */
  privateIntelligence: "private, max-age=8, stale-while-revalidate=20",
  /** Listagens estáveis (rotinas, agentes). */
  privateCatalog: "private, max-age=30, stale-while-revalidate=60",
  /** Nunca cachear mutações ou dados sensíveis. */
  noStore: "private, no-store, must-revalidate",
  /** Assets estáticos versionados (via next.config). */
  immutable: "public, max-age=31536000, immutable",
} as const;

export type CacheProfile = keyof typeof CACHE;

export function cacheControlHeader(profile: CacheProfile): string {
  return CACHE[profile];
}

export function withCacheHeaders(
  init: ResponseInit | undefined,
  profile: CacheProfile,
): ResponseInit {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", CACHE[profile]);
  return { ...init, headers };
}
