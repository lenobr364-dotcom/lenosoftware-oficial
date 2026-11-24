import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { acceptProposal, formalizeAndReleaseContacts } from "@/lib/comercial/store";

export const runtime = "nodejs";

const acceptSchema = z.object({
  actorId: z.string().min(1).default("locatario-demo"),
  actorRole: z.enum(["locador", "locatario", "operador", "cliente"]).default("locatario"),
  acceptExclusivity: z.boolean(),
  acknowledgeCnpj: z.string().min(8),
  formalize: z.boolean().optional().default(false),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = acceptSchema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Dados de aceite inválidos.",
        scope: "comercial.proposals.accept.POST",
        cause: parsed.error,
      });
    }

    const accepted = acceptProposal({
      proposalId: id,
      actorId: parsed.data.actorId,
      actorRole: parsed.data.actorRole,
      acceptExclusivity: parsed.data.acceptExclusivity,
      acknowledgeCnpj: parsed.data.acknowledgeCnpj,
    });

    if (!accepted.ok) {
      return jsonApiError(400, {
        error: accepted.error,
        message: accepted.message,
        scope: "comercial.proposals.accept.POST",
      });
    }

    if (parsed.data.formalize) {
      const released = formalizeAndReleaseContacts(id);
      if (!released.ok) {
        return jsonApiError(400, {
          error: released.error,
          message: released.message,
          scope: "comercial.proposals.accept.POST",
        });
      }
      return NextResponse.json({
        ok: true,
        proposal: released.proposal,
        equipment: released.equipment,
        exclusivity: accepted.exclusivity,
        contactsReleased: true,
      });
    }

    return NextResponse.json({
      ok: true,
      proposal: accepted.proposal,
      exclusivity: accepted.exclusivity,
      contactsReleased: false,
      notice: "Exclusividade aceita. Contatos liberam após formalização/pagamento Pix.",
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_proposals_accept_failed",
      message: "Falha ao aceitar proposta.",
      scope: "comercial.proposals.accept.POST",
      cause,
    });
  }
}
