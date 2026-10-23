/**
 * Alertas imediatos ao administrador (e-mail + WhatsApp opcional).
 *
 * E-mail: `RESEND_API_KEY` + destino `CHEMVAULT_ADMIN_ALERT_EMAIL` ou `ADMIN_EMAIL`.
 * WhatsApp (Twilio): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (ex. whatsapp:+14155238886),
 * `TWILIO_WHATSAPP_TO_ADMIN` (ex. whatsapp:+5511999999999).
 */
import { sendTransactionalEmail } from "@/lib/outbound-mail";

function adminAlertEmail(): string | null {
  return (
    process.env.CHEMVAULT_ADMIN_ALERT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    null
  );
}

async function sendTwilioWhatsApp(body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  const to = process.env.TWILIO_WHATSAPP_TO_ADMIN?.trim();
  if (!sid || !token || !from || !to) return false;

  const auth = Buffer.from(`${sid}:${token}`, "utf8").toString("base64");
  const params = new URLSearchParams({
    From: from,
    To: to,
    Body: body.slice(0, 1500),
  });

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 12_000);
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
      signal: ac.signal,
    });
    return r.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function fireAndForget(p: Promise<unknown>): void {
  void p.catch(() => undefined);
}

async function dispatchAdminAlert(subject: string, text: string): Promise<void> {
  const to = adminAlertEmail();
  if (to) {
    fireAndForget(
      sendTransactionalEmail({
        to,
        subject: `[ChemVault] ${subject}`,
        text,
        html: `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${text.replace(/</g, "&lt;")}</pre>`,
      }),
    );
  }
  fireAndForget(sendTwilioWhatsApp(`*${subject}*\n${text}`));
}

export function notifyAdminInternationalLicenseActivated(input: {
  transactionCode: string;
  locale: string;
  signerEmail: string | null;
  currencyCode: string;
}): void {
  const text = [
    "International license terms accepted (vault unlock path).",
    `Transaction: ${input.transactionCode}`,
    `Locale: ${input.locale}`,
    `Currency: ${input.currencyCode}`,
    `Signer: ${input.signerEmail ?? "—"}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n");
  void dispatchAdminAlert("International license activated", text);
}

export function notifyAdminCriticalSecurity(input: {
  type: string;
  title: string;
  detail?: string | null;
  requestPath?: string | null;
  region?: string | null;
}): void {
  const text = [
    `Type: ${input.type}`,
    `Title: ${input.title}`,
    input.detail ? `Detail: ${input.detail}` : "",
    input.requestPath ? `Path: ${input.requestPath}` : "",
    input.region ? `Region: ${input.region}` : "",
    `Time: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");
  void dispatchAdminAlert("CRITICAL security event", text);
}
