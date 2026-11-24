import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { acceptProposal, formalizeAndReleaseContacts } from "@/lib/britagrid/store";
import { BRITAGRID_OPERATOR } from "@/lib/britagrid/exclusivity-terms";

export const runtime = "nodejs";

const acceptSchema = z.object({
  actorId: z.string().min(1).default("locatario-demo"),
  actorRole: z.enum(["locador", "locatario", "operador"]).default("locatario"),
  acceptExclusivity: z.literal(true),
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
        message:
          "Aceite exige acceptExclusivity=true e confirmação do CNPJ da Leno.software.",
        scope: "britagrid.proposals.accept.POST",
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
      const status =
        accepted.error === "proposal_not_found"
          ? 404
          : accepted.error === "exclusivity_required" || accepted.error === "cnpj_mismatch"
            ? 422
            : 400;
      return jsonApiError(status, {
        error: accepted.error,
        message: accepted.message,
        scope: "britagrid.proposals.accept.POST",
      });
    }

    let formalized = null;
    if (parsed.data.formalize) {
      const rel = formalizeAndReleaseContacts(id);
      if (rel.ok) formalized = rel;
    }

    return NextResponse.json({
      ok: true,
      proposal: formalized?.proposal ?? accepted.proposal,
      exclusivity: accepted.exclusivity,
      equipment: formalized?.equipment ?? null,
      operator: BRITAGRID_OPERATOR,
      message: formalized
        ? "Proposta formalizada. Contatos liberados conforme autorização da plataforma."
        : "Aceite de exclusividade/comissão registrado. Contatos permanecem ocultos até formalização.",
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_accept_failed",
      message: "Falha ao aceitar proposta.",
      scope: "britagrid.proposals.accept.POST",
      cause,
    });
  }
}
