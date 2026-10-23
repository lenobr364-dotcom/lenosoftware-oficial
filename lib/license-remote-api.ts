export type RemoteLicenseValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let circuitOpenUntilMs = 0;
let consecutiveFailures = 0;

function parsePositiveInt(raw: string | undefined, fallback: number, max: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(1, n));
}

/**
 * Optional remote license desk. When LICENSE_API_BASE_URL is unset, callers should skip.
 * Uses bounded retries, per-attempt timeouts, and a lightweight circuit breaker for storm protection.
 */
export async function validateLicenseRemote(input: {
  subject: string;
  tier?: string;
}): Promise<RemoteLicenseValidationResult> {
  const base = process.env.LICENSE_API_BASE_URL?.trim();
  if (!base) return { ok: true };

  if (Date.now() < circuitOpenUntilMs) {
    return { ok: false, reason: "license_api_circuit_open" };
  }

  const path = process.env.LICENSE_API_VALIDATE_PATH?.trim() || "/v1/licenses/validate";
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const apiKey = process.env.LICENSE_API_KEY?.trim();

  const maxAttempts = parsePositiveInt(process.env.LICENSE_API_MAX_RETRIES, 3, 8);
  const timeoutMs = parsePositiveInt(process.env.LICENSE_API_TIMEOUT_MS, 5000, 30_000);

  let lastReason = "license_api_unreachable";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          licenseId: input.subject,
          tier: input.tier ?? null,
        }),
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.status === 204) {
        consecutiveFailures = 0;
        return { ok: true };
      }

      if (res.status === 200) {
        let body: unknown;
        try {
          body = await res.json();
        } catch {
          consecutiveFailures = 0;
          return { ok: true };
        }
        if (body && typeof body === "object") {
          const record = body as Record<string, unknown>;
          if (record.valid === true || record.active === true || record.authorized === true) {
            consecutiveFailures = 0;
            return { ok: true };
          }
        }
        consecutiveFailures = 0;
        return { ok: false, reason: "license_api_rejected" };
      }

      if (res.status === 401 || res.status === 403) {
        consecutiveFailures = 0;
        return { ok: false, reason: "license_api_forbidden" };
      }

      lastReason = `license_api_http_${res.status}`;
    } catch (err) {
      clearTimeout(timer);
      lastReason = err instanceof Error && err.name === "AbortError" ? "license_api_timeout" : "license_api_network";
    }

    if (attempt < maxAttempts - 1) {
      await sleep(120 * 2 ** attempt);
    }
  }

  consecutiveFailures += 1;
  if (consecutiveFailures >= 5) {
    circuitOpenUntilMs = Date.now() + 30_000;
    consecutiveFailures = 0;
  }

  return { ok: false, reason: lastReason };
}
