import { createHmac, randomUUID } from "node:crypto";

import type { SecuritySeverity } from "@prisma/client";

/** Licença ou sessão privilegiada ativada com sucesso (portal, vault ou CEO). */
export const WEBHOOK_EVENT_LICENSE_ACTIVATED = "chemvault.license.activated";

/** Evento de segurança alinhado a tentativas de abuso / invasão. */
export const WEBHOOK_EVENT_SECURITY_INTRUSION = "chemvault.security.intrusion_detected";

/** Chamado de suporte / ticket aberto por licenciado ou painel. */
export const WEBHOOK_EVENT_SUPPORT_TICKET = "chemvault.support.ticket_created";

const INTRUSION_SECURITY_TYPES = new Set([
  "portal_auth_failure",
  "vault_unlock_denied",
  "geofence_policy_denied",
  "geofence_mass_anomaly",
  "portal_license_suspended",
  "ceo_login_failure",
]);

function webhookTargets(): string[] {
  const raw =
    process.env.CHEMVAULT_WEBHOOK_URLS?.trim() ||
    process.env.CHEMVAULT_WEBHOOK_URL?.trim() ||
    "";
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((u) => u.length > 0 && /^https?:\/\//i.test(u));
}

function signBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function postToUrl(url: string, body: string, headers: Record<string, string>): Promise<Response> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 5000);
  return fetch(url, {
    method: "POST",
    headers,
    body,
    signal: ac.signal,
  }).finally(() => clearTimeout(timer));
}

function dispatchEvent(event: string, data: Record<string, unknown>): void {
  const urls = webhookTargets();
  if (urls.length === 0) return;

  const envelope = {
    id: randomUUID(),
    event,
    occurredAt: new Date().toISOString(),
    data,
  };
  const body = JSON.stringify(envelope);
  const secret = process.env.CHEMVAULT_WEBHOOK_SECRET?.trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "ChemVault-Webhooks/1",
  };
  if (secret) {
    headers["X-ChemVault-Signature"] = `sha256=${signBody(secret, body)}`;
  }

  void Promise.allSettled(urls.map((url) => postToUrl(url, body, headers))).then(() => undefined);
}

export function dispatchLicenseActivatedWebhook(data: {
  source: "portal" | "vault_unlock" | "ceo";
  subject: string;
  region: string;
  ip?: string | null;
  channel?: string;
}): void {
  dispatchEvent(WEBHOOK_EVENT_LICENSE_ACTIVATED, {
    source: data.source,
    subject: data.subject,
    region: data.region,
    ip: data.ip ?? undefined,
    channel: data.channel,
  });
}

export function dispatchSupportTicketWebhook(data: {
  subject: string;
  body: string;
  priority: string;
  requesterEmail: string;
  requesterName?: string | null;
  uiLocale?: string | null;
}): void {
  dispatchEvent(WEBHOOK_EVENT_SUPPORT_TICKET, {
    subject: data.subject,
    body: data.body,
    priority: data.priority,
    requesterEmail: data.requesterEmail,
    requesterName: data.requesterName ?? undefined,
    uiLocale: data.uiLocale ?? undefined,
  });
}

export function dispatchIntrusionWebhook(input: {
  type: string;
  severity: SecuritySeverity;
  title: string;
  detail?: string | null;
  requestPath?: string | null;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  region?: string | null;
}): void {
  if (!INTRUSION_SECURITY_TYPES.has(input.type)) return;
  dispatchEvent(WEBHOOK_EVENT_SECURITY_INTRUSION, {
    securityType: input.type,
    severity: input.severity,
    title: input.title,
    detail: input.detail ?? undefined,
    requestPath: input.requestPath ?? undefined,
    requestId: input.requestId ?? undefined,
    ip: input.ip ?? undefined,
    userAgent: input.userAgent ?? undefined,
    region: input.region ?? undefined,
  });
}
