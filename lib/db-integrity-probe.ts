import type { PrismaClient } from "@prisma/client";

/** Alertas só em log (não expor detalhes ao cliente). */
const LOG_PREFIX = "[db-integrity]";

/** Acima disto: possível pressão em I/O ou índices nas tabelas de licenciamento. */
const LICENSE_AGGREGATE_SLOW_MS = 500;

function isSqliteDatasourceUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("file:") || /\.db(\?|$)/i.test(u) || u.includes("sqlite");
}

/**
 * Verificação leve: integridade SQLite (quando aplicável) e latência de agregações
 * em modelos de licenciamento. Falhas e lentidão → `console.warn` (alerta silencioso).
 */
export async function runDatabaseIntegrityProbe(prisma: PrismaClient): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (isSqliteDatasourceUrl(databaseUrl)) {
    try {
      const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>("PRAGMA quick_check");
      const first = rows[0];
      const cell =
        first == null
          ? ""
          : (typeof first.quick_check === "string"
              ? first.quick_check
              : String(Object.values(first)[0] ?? ""));
      if (cell !== "ok") {
        console.warn(LOG_PREFIX, "PRAGMA quick_check reported an issue", { cell, rowCount: rows.length });
      }
    } catch (e) {
      console.warn(LOG_PREFIX, "PRAGMA quick_check failed", { message: e instanceof Error ? e.message : String(e) });
    }
  } else {
    console.warn(LOG_PREFIX, "skipped PRAGMA quick_check (non-SQLite DATABASE_URL); add provider-specific checks if needed");
  }

  const t0 = Date.now();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.licenseActivity.count();
      await tx.licenseRequest.count();
    });
    const ms = Date.now() - t0;
    if (ms > LICENSE_AGGREGATE_SLOW_MS) {
      console.warn(LOG_PREFIX, "slow licensing aggregate probe", { ms, thresholdMs: LICENSE_AGGREGATE_SLOW_MS });
    }
  } catch (e) {
    console.warn(LOG_PREFIX, "licensing aggregate probe failed", { message: e instanceof Error ? e.message : String(e) });
  }
}
