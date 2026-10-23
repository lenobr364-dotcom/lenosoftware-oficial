export type SendMailResult =
  | { ok: true; provider: "resend" }
  | { ok: false; skipped: string };

/**
 * E-mail transacional (Resend HTTP API — sem dependência SMTP).
 * Configure `RESEND_API_KEY` e opcionalmente `CHEMVAULT_MAIL_FROM` (ex.: `ChemVault <noreply@seudominio.com>`).
 */
export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<SendMailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.CHEMVAULT_MAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    "ChemVault <onboarding@resend.dev>";
  if (!key) {
    return { ok: false, skipped: "no_resend_api_key" };
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 12_000);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
      signal: ac.signal,
    });
    if (!r.ok) {
      return { ok: false, skipped: `resend_http_${r.status}` };
    }
    return { ok: true, provider: "resend" };
  } catch {
    return { ok: false, skipped: "resend_network" };
  } finally {
    clearTimeout(t);
  }
}
