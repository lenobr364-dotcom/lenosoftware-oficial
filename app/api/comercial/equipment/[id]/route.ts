import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { getPublicEquipment } from "@/lib/comercial/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const equipment = getPublicEquipment(id);
    if (!equipment) {
      return jsonApiError(404, {
        error: "equipment_not_found",
        message: "Equipamento não encontrado.",
        scope: "comercial.equipment.[id].GET",
      });
    }
    return NextResponse.json({ ok: true, equipment });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_equipment_get_failed",
      message: "Falha ao obter equipamento.",
      scope: "comercial.equipment.[id].GET",
      cause,
    });
  }
}
