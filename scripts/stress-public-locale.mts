/**
 * Carga leve paralela em rotas públicas localizadas (home) para verificar latência sob concorrência.
 *
 * Uso:
 *   npx tsx scripts/stress-public-locale.mts http://localhost:3000 200
 *
 * Requer o servidor em execução (`npm run start` ou `npm run dev`).
 */

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const total = Math.max(1, Math.min(5000, Number(process.argv[3] ?? "150") || 150));
const paths = ["/en", "/de", "/pt", "/hi", "/ar"];

async function one(i: number): Promise<{ ok: boolean; status: number; ms: number; path: string }> {
  const path = paths[i % paths.length]!;
  const t0 = performance.now();
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: { "X-Stress-Seq": String(i), Accept: "text/html" },
      redirect: "manual",
    });
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status, ms: performance.now() - t0, path };
  } catch {
    return { ok: false, status: 0, ms: performance.now() - t0, path };
  }
}

const started = performance.now();
const results = await Promise.all(Array.from({ length: total }, (_, i) => one(i)));
const elapsed = performance.now() - started;

const byStatus = new Map<number, number>();
let okHttp = 0;
for (const r of results) {
  if (r.ok) okHttp++;
  byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
}
const ms = results.map((r) => r.ms).sort((a, b) => a - b);
const p50 = ms[Math.floor(ms.length * 0.5)] ?? 0;
const p95 = ms[Math.floor(ms.length * 0.95)] ?? 0;

console.log(
  JSON.stringify(
    {
      baseUrl,
      concurrent: total,
      wallClockMs: Math.round(elapsed),
      http2xx3xxCount: okHttp,
      statusHistogram: Object.fromEntries(byStatus),
      latencyMs: {
        min: Math.round(ms[0] ?? 0),
        p50: Math.round(p50),
        p95: Math.round(p95),
        max: Math.round(ms[ms.length - 1] ?? 0),
      },
      note: "Public locale HTML routes; dashboard UI fluidity also depends on CEO session + client hydration.",
    },
    null,
    2,
  ),
);
