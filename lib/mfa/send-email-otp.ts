import { sendTransactionalEmail } from "@/lib/outbound-mail";

export async function sendAdminMfaOtpEmail(to: string, code: string): Promise<boolean> {
  const r = await sendTransactionalEmail({
    to,
    subject: "ChemVault — verification code",
    text: `Your ChemVault verification code is: ${code}\n\nIt expires in 10 minutes. If you did not request this, ignore this message.`,
    html: `<p>Your ChemVault verification code is:</p><p style="font-size:1.5rem;letter-spacing:0.2em;font-weight:600">${code}</p><p style="color:#666;font-size:0.875rem">Expires in 10 minutes.</p>`,
  });
  return r.ok;
}
