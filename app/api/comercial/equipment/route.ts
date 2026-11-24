import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { getExclusivityTerms } from "@/lib/anti-disintermediation/exclusivity-terms";
import { listPublicEquipment } from "@/lib/comercial/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      equipment: listPublicEquipment(),
      terms: getExclusivityTerms(),
      notice:
        "Contatos estruturados e texto livre permanecem mascarados até aceite de exclusividade e pagamento/formalização no fluxo atual.",
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_equipment_list_failed",
      message: "Falha ao listar equipamentos da frota comercial.",
      scope: "comercial.equipment.GET",
      cause,
    });
  }
}
