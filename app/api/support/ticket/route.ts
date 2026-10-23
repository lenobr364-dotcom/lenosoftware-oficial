import { NextRequest, NextResponse } from "next/server";

import { requireCeoApiSession } from "@/lib/admin-api-auth";
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

  const email = await notifySupportTicket({
    subject: parsed.data.subject.trim(),
    body: parsed.data.body.trim(),
    priority: parsed.data.priority ?? "normal",
    requesterEmail: parsed.data.requesterEmail.trim(),
    requesterName: parsed.data.requesterName?.trim() ?? null,
    uiLocale: parsed.data.uiLocale ?? null,
  });

  return NextResponse.json({
    ok: true,
    delivery: { email: email.email },
  });
}
