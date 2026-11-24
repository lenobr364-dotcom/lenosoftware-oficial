import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { createProposal, listProposals } from "@/lib/britagrid/store";
import { getExclusivityTerms } from "@/lib/britagrid/exclusivity-terms";

export const runtime = "nodejs";

const createSchema = z.object({
  equipmentId: z.string().min(1),
  locatarioId: z.string().min(1).default("locatario-demo"),
  locatarioDisplayName: z.string().min(1).max(120).default("Locatário"),
  notes: z.string().max(4000).default(""),
  requestedHours: z.number().positive().max(10_000),
  estimatedTons: z.number().nonnegative().max(1_000_000).default(0),
});

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      proposals: listProposals(),
      terms: getExclusivityTerms(),
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_proposals_list_failed",
      message: "Falha ao listar propostas.",
      scope: "britagrid.proposals.GET",
      cause,
    });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Dados da proposta inválidos.",
        scope: "britagrid.proposals.POST",
        cause: parsed.error,
      });
    }

    const result = createProposal(parsed.data);
    if (!result.ok) {
      return jsonApiError(404, {
        error: result.error,
        message: result.message,
        scope: "britagrid.proposals.POST",
      });
    }

    return NextResponse.json(
      {
        ok: true,
        proposal: result.proposal,
        notesSanitized: result.notesSanitized,
        notice:
          "Proposta registrada no fluxo intermediado BritaGrid. Contatos permanecem ocultos até aceite de exclusividade e liberação.",
      },
      { status: 201 },
    );
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_proposals_create_failed",
      message: "Falha ao criar proposta.",
      scope: "britagrid.proposals.POST",
      cause,
    });
  }
}
