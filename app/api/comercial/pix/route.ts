import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import { EXPECTED_LENO_CNPJ } from "@/lib/anti-disintermediation/exclusivity-terms";
import {
  formalizeAndReleaseContacts,
  getProposal,
} from "@/lib/comercial/store";

export const runtime = "nodejs";

/**
 * Pix do fluxo comercial existente (espelha `backend/routers/financeiro.py`).
 * Exige proposta com exclusividade aceita; ao confirmar, libera contatos.
 */
const pixSchema = z.object({
  proposalId: z.string().min(1),
  valor: z.number().positive().max(10_000_000),
  descricao: z.string().min(1).max(500),
  clienteEmail: z.string().email().max(320),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = pixSchema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Dados Pix inválidos.",
        scope: "comercial.pix.POST",
        cause: parsed.error,
      });
    }

    const proposal = getProposal(parsed.data.proposalId);
    if (!proposal) {
      return jsonApiError(404, {
        error: "proposal_not_found",
        message: "Proposta não encontrada.",
        scope: "comercial.pix.POST",
      });
    }
    if (!proposal.exclusivityAccepted) {
      return jsonApiError(403, {
        error: "exclusivity_required",
        message:
          "Aceite os termos de exclusividade/comissão Leno.software antes de gerar o Pix.",
        scope: "comercial.pix.POST",
      });
    }

    const chavePix = process.env.PIX_CHAVE_PRIMARIA?.trim() || EXPECTED_LENO_CNPJ;
    const released = formalizeAndReleaseContacts(parsed.data.proposalId);
    if (!released.ok) {
      return jsonApiError(400, {
        error: released.error,
        message: released.message,
        scope: "comercial.pix.POST",
      });
    }

    return NextResponse.json({
      ok: true,
      status: "sucesso",
      agente_emissor: "Lumen onel",
      chave_recebedora: chavePix,
      cobranca: {
        valor: parsed.data.valor,
        descricao: parsed.data.descricao,
        linha_digitavel: `00020126580014br.gov.bcb.pix0136${chavePix}5204000053039865802BR5913Leno Software6015Barra do Garcas62070503***6304ABCD`,
      },
      email_cliente_notificado: parsed.data.clienteEmail,
      proposal: released.proposal,
      equipment: released.equipment,
      contactsReleased: true,
      timestamp: new Date().toISOString(),
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_pix_failed",
      message: "Falha ao gerar cobrança Pix.",
      scope: "comercial.pix.POST",
      cause,
    });
  }
}
