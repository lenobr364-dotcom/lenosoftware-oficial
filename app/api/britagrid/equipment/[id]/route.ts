import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { getPublicEquipment } from "@/lib/britagrid/store";

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
        scope: "britagrid.equipment.[id].GET",
      });
    }
    return NextResponse.json({
      ok: true,
      equipment,
      antiDisintermediation: !equipment.contactReleased,
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_equipment_get_failed",
      message: "Falha ao carregar equipamento.",
      scope: "britagrid.equipment.[id].GET",
      cause,
    });
  }
}
