/**
 * Otimizações SQLite para baixa latência (WAL + pragmas seguros).
 */

import { prisma } from "@/lib/prisma";

let bootstrapped = false;

export async function ensureDatabasePerformancePragmas(): Promise<void> {
  if (bootstrapped) return;
  try {
    await prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$executeRawUnsafe("PRAGMA synchronous = NORMAL;");
    await prisma.$executeRawUnsafe("PRAGMA cache_size = -64000;");
    await prisma.$executeRawUnsafe("PRAGMA temp_store = MEMORY;");
    bootstrapped = true;
  } catch {
    /* provider não-SQLite ou ambiente restrito */
  }
}

export async function pingDatabase(): Promise<number> {
  const started = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  return Math.round((performance.now() - started) * 100) / 100;
}
