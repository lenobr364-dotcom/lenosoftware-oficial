import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { listMessages, postMessage } from "@/lib/comercial/store";

export const runtime = "nodejs";

const postSchema = z.object({
  proposalId: z.string().min(1),
  senderId: z.string().min(1).default("locatario-demo"),
  senderRole: z.enum(["locador", "locatario", "operador", "cliente"]).default("locatario"),
  body: z.string().min(1).max(4000),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const proposalId = url.searchParams.get("proposalId")?.trim() ?? "";
    if (!proposalId) {
      return jsonApiError(400, {
        error: "proposal_id_required",
        message: "Informe proposalId.",
        scope: "comercial.messages.GET",
      });
    }
    return NextResponse.json({ ok: true, messages: listMessages(proposalId) });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_messages_list_failed",
      message: "Falha ao listar mensagens.",
      scope: "comercial.messages.GET",
      cause,
    });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = postSchema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Mensagem inválida.",
        scope: "comercial.messages.POST",
        cause: parsed.error,
      });
    }

    const result = postMessage(parsed.data);
    if (!result.ok) {
      const status = result.error === "contact_blocked" ? 422 : 404;
      return jsonApiError(status, {
        error: result.error,
        message: result.message,
        scope: "comercial.messages.POST",
      });
    }

    return NextResponse.json({ ok: true, message: result.message }, { status: 201 });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_messages_post_failed",
      message: "Falha ao enviar mensagem.",
      scope: "comercial.messages.POST",
      cause,
    });
  }
}
