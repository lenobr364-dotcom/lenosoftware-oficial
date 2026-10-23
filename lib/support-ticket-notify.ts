import { dispatchSupportTicketWebhook } from "@/lib/webhook-dispatch";
import { sendTransactionalEmail } from "@/lib/outbound-mail";

export type SupportTicketInput = {
  subject: string;
  body: string;
  priority: "low" | "normal" | "high";
  requesterEmail: string;
  requesterName?: string | null;
  uiLocale?: string | null;
};

/**
 * Notifica equipa interna: webhooks (`CHEMVAULT_WEBHOOK_URLS`) + e-mail opcional (Resend).
 * Destino do e-mail: `CHEMVAULT_SUPPORT_INBOX_EMAIL` ou `ADMIN_EMAIL`.
 */
export async function notifySupportTicket(input: SupportTicketInput): Promise<{ email: "sent" | "skipped" | "failed" }> {
  dispatchSupportTicketWebhook({
    subject: input.subject,
    body: input.body,
    priority: input.priority,
    requesterEmail: input.requesterEmail,
    requesterName: input.requesterName,
    uiLocale: input.uiLocale,
  });

  const inbox =
    process.env.CHEMVAULT_SUPPORT_INBOX_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "";
  if (!inbox) {
    return { email: "skipped" };
  }

  const text = [
    `ChemVault — novo pedido de suporte`,
    ``,
    `Prioridade: ${input.priority}`,
    `Remetente: ${input.requesterName ?? "—"} <${input.requesterEmail}>`,
    `Locale UI: ${input.uiLocale ?? "—"}`,
    ``,
    `Assunto: ${input.subject}`,
    ``,
    input.body,
  ].join("\n");

  const r = await sendTransactionalEmail({
    to: inbox,
    subject: `[ChemVault Support] ${input.subject}`,
    text,
    html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
  });

  return { email: r.ok ? "sent" : "failed" };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
