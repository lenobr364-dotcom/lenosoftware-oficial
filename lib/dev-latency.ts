/**
 * Simula latência de rede (dev / laboratório). Em produção é ignorado salvo override explícito.
 * Útil para validar skeletons com `SIMULATE_API_LATENCY_MS=400`.
 */
export async function simulateOptionalLatency(scope: string): Promise<void> {
  const raw = process.env.SIMULATE_API_LATENCY_MS?.trim();
  if (!raw) return;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SIMULATED_LATENCY_IN_PROD?.trim() !== "true") {
    return;
  }
  const ms = Math.min(8000, Math.max(0, Number.parseInt(raw, 10) || 0));
  if (ms <= 0) return;
  if (process.env.LAB_VERBOSE_ERRORS?.trim() === "true" || process.env.NODE_ENV !== "production") {
    console.log(JSON.stringify({ level: "debug", scope: "dev-latency", message: `sleep ${ms}ms`, context: scope }));
  }
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}
