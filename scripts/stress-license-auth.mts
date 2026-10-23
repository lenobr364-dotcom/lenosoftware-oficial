/**
 * Stress test: N requisições HTTP paralelas a POST /api/auth (licenciamento portal).
 *
 * Uso:
 *   npx tsx scripts/stress-license-auth.mts http://localhost:3000 100
 *
 * Corpo JSON: variável de ambiente CHEMVAULT_STRESS_AUTH_BODY (default chave inválida → stress do caminho de negação).
 *
 * Exemplo com token real (cuidado — gera carga e cookies no servidor):
 *   set CHEMVAULT_STRESS_AUTH_BODY={"licenseToken":"..."} && npx tsx scripts/stress-license-auth.mts http://localhost:3000 100
 */

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const total = Math.max(1, Math.min(5000, Number(process.argv[3] ?? "100") || 100));
const body =
  process.env.CHEMVAULT_STRESS_AUTH_BODY?.trim() ||
  JSON.stringify({ key: "chemvault-stress-invalid-key-xxxxxxxx" });

async function one(i: number): Promise<{ ok: boolean; status: number; ms: number }> {
  const t0 = performance.now();
  try {
    const res = await fetch(`${baseUrl}/api/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Stress-Seq": String(i) },
      body,
    });
    return { ok: res.ok, status: res.status, ms: performance.now() - t0 };
  } catch {
    return { ok: false, status: 0, ms: performance.now() - t0 };
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
      httpOkCount: okHttp,
      statusHistogram: Object.fromEntries(byStatus),
      latencyMs: { min: Math.round(ms[0] ?? 0), p50: Math.round(p50), p95: Math.round(p95), max: Math.round(ms[ms.length - 1] ?? 0) },
    },
    null,
    2,
  ),
);
