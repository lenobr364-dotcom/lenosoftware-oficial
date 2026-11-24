import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import {
  calculateDetailedProposalCost,
  type LithologyId,
} from "@/lib/anti-disintermediation/calculators";
import { buildCommercialProposalPdf } from "@/lib/comercial/proposal-pdf";
import { getEquipmentRaw, getProposal, toPublicEquipment } from "@/lib/comercial/store";

export const runtime = "nodejs";

const querySchema = z.object({
  lithology: z
    .enum(["arenito", "calcário", "basalto", "granito", "quartzito"])
    .default("basalto"),
  commissionKind: z.enum(["subscriber", "adhoc"]).default("subscriber"),
  dryMachineHourBrl: z.coerce.number().positive().optional(),
  dieselLitersPerHour: z.coerce.number().nonnegative().optional(),
  dieselPricePerLiterBrl: z.coerce.number().nonnegative().optional(),
  wearBasePerHourBrl: z.coerce.number().nonnegative().optional(),
  mobilizationBrl: z.coerce.number().nonnegative().optional(),
  demobilizationBrl: z.coerce.number().nonnegative().optional(),
});

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const proposal = getProposal(id);
    if (!proposal) {
      return jsonApiError(404, {
        error: "proposal_not_found",
        message: "Proposta não encontrada.",
        scope: "comercial.proposals.pdf.GET",
      });
    }

    const eqRaw = getEquipmentRaw(proposal.equipmentId);
    if (!eqRaw) {
      return jsonApiError(404, {
        error: "equipment_not_found",
        message: "Equipamento da proposta não encontrado.",
        scope: "comercial.proposals.pdf.GET",
      });
    }

    const url = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_query",
        message: "Parâmetros de PDF inválidos.",
        scope: "comercial.proposals.pdf.GET",
        cause: parsed.error,
      });
    }

    const q = parsed.data;
    const costs = calculateDetailedProposalCost({
      dryMachineHourBrl: q.dryMachineHourBrl ?? eqRaw.hourlyRateBrl,
      machineHours: proposal.requestedHours,
      tons: proposal.estimatedTons,
      lithology: q.lithology as LithologyId,
      dieselLitersPerHour: q.dieselLitersPerHour,
      dieselPricePerLiterBrl: q.dieselPricePerLiterBrl,
      wearBasePerHourBrl: q.wearBasePerHourBrl,
      mobilizationBrl: q.mobilizationBrl ?? 2500,
      demobilizationBrl: q.demobilizationBrl ?? 1800,
    });

    const equipment = toPublicEquipment(eqRaw);
    const pdf = buildCommercialProposalPdf({
      proposal,
      equipment,
      costs,
      commissionKind: q.commissionKind,
      includeContacts: proposal.contactReleased,
    });

    const filename = `proposta-${proposal.id}.pdf`;
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_proposal_pdf_failed",
      message: "Falha ao gerar PDF da proposta.",
      scope: "comercial.proposals.pdf.GET",
      cause,
    });
  }
}
