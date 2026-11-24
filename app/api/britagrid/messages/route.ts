import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { listMessages, postMessage } from "@/lib/britagrid/store";
import { ANTI_DISINTERMEDIATION_NOTICE } from "@/lib/britagrid/exclusivity-terms";

export const runtime = "nodejs";

const postSchema = z.object({
  proposalId: z.string().min(1),
  senderId: z.string().min(1).default("user-demo"),
  senderRole: z.enum(["locador", "locatario", "operador"]).default("locatario"),
  body: z.string().min(1).max(4000),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    if (!proposalId) {
      return jsonApiError(400, {
        error: "proposal_id_required",
        message: "Informe proposalId.",
        scope: "britagrid.messages.GET",
      });
    }
    return NextResponse.json({
      ok: true,
      messages: listMessages(proposalId),
      notice: ANTI_DISINTERMEDIATION_NOTICE,
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_messages_list_failed",
      message: "Falha ao listar mensagens.",
      scope: "britagrid.messages.GET",
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
        scope: "britagrid.messages.POST",
        cause: parsed.error,
      });
    }

    const result = postMessage(parsed.data);
    if (!result.ok) {
      const status = result.error === "contact_blocked" ? 422 : 404;
      return jsonApiError(status, {
        error: result.error,
        message: result.message,
        scope: "britagrid.messages.POST",
      });
    }

    return NextResponse.json(
      {
        ok: true,
        message: result.message,
        notice: result.message.blockedAttempt
          ? "Tentativa de contato direto mascarada/bloqueada pela BritaGrid."
          : undefined,
      },
      { status: 201 },
    );
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_messages_post_failed",
      message: "Falha ao enviar mensagem.",
      scope: "britagrid.messages.POST",
      cause,
    });
  }
}
