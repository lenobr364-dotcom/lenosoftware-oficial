/**
 * Registo de segurança acionável a partir do Edge (middleware) via POST interno.
 * Requer CHEMVAULT_INTERNAL_LOG_SECRET + rota `/api/internal/security-event`.
 */
export type SecurityEdgePayload = {
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  detail?: string;
  requestPath?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  region?: string;
};

export function enqueueSecurityLog(origin: string, payload: SecurityEdgePayload): void {
  const secret = process.env.CHEMVAULT_INTERNAL_LOG_SECRET?.trim();
  if (!secret) return;
  const url = `${origin.replace(/\/$/, "")}/api/internal/security-event`;
  void fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chemvault-internal": secret,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
