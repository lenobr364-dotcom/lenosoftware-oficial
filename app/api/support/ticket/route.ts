import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
import { sanitizeUserInput } from "@/lib/anti-disintermediation/contact-sanitize";
import { notifySupportTicket } from "@/lib/support-ticket-notify";
import { supportTicketBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await requireCeoApiSession(request);
  if (denied) return denied;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = supportTicketBodySchema.safeParse(raw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const subjectResult = sanitizeUserInput(parsed.data.subject.trim(), "mask");
  const bodyResult = sanitizeUserInput(parsed.data.body.trim(), "mask");
  if (!bodyResult.sanitized.trim() && bodyResult.blocked) {
    return NextResponse.json(
      {
        ok: false,
        error: "contact_blocked",
        message:
          "Mensagem bloqueada: remova telefones, WhatsApp, e-mails, @usuários e links externos do corpo do pedido.",
      },
      { status: 422 },
    );
  }

  const email = await notifySupportTicket({
    subject: subjectResult.sanitized,
    body: bodyResult.sanitized,
    priority: parsed.data.priority ?? "normal",
    requesterEmail: parsed.data.requesterEmail.trim(),
    requesterName: parsed.data.requesterName?.trim() ?? null,
    uiLocale: parsed.data.uiLocale ?? null,
  });

  return NextResponse.json({
    ok: true,
    delivery: { email: email.email },
    sanitized: subjectResult.changed || bodyResult.changed,
  });
}
