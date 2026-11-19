/**
 * WAL/pragmas só existem no SQLite. PostgreSQL (produção) ignora este passo.
 */

import { prisma } from "@/lib/prisma";

let bootstrapped = false;

function isSqliteUrl(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.startsWith("file:") || url.includes("sqlite");
}

export async function ensureDatabasePerformancePragmas(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;
  if (!isSqliteUrl()) return;
  try {
    await prisma.$executeRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$executeRawUnsafe("PRAGMA synchronous = NORMAL;");
    await prisma.$executeRawUnsafe("PRAGMA cache_size = -64000;");
    await prisma.$executeRawUnsafe("PRAGMA temp_store = MEMORY;");
  } catch {
    /* arquivo SQLite indisponível neste processo */
  }
}

export async function pingDatabase(): Promise<number> {
  const started = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  return Math.round((performance.now() - started) * 100) / 100;
}
