import { NextResponse } from "next/server";

import { jsonApiError } from "@/lib/api-error-response";
import { sanitizeUserInput } from "@/lib/britagrid/contact-sanitize";
import { listPublicEquipment } from "@/lib/britagrid/store";

export const runtime = "nodejs";

/** Listagem pública — contatos e trechos sensíveis já mascarados. */
export async function GET() {
  try {
    const equipment = listPublicEquipment();
    return NextResponse.json({
      ok: true,
      equipment,
      antiDisintermediation: true,
      notice:
        "Contatos diretos ocultos até formalização e liberação autorizada pela BritaGrid Brasil.",
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_equipment_list_failed",
      message: "Falha ao listar equipamentos BritaGrid.",
      scope: "britagrid.equipment.GET",
      cause,
    });
  }
}

/**
 * Endpoint de pré-visualização de sanitização (descrições/observações).
 * Não persiste equipamento novo — evita expandir escopo além da proteção.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      description?: string;
      observations?: string;
      mode?: "mask" | "reject";
    };
    const mode = body.mode === "reject" ? "reject" : "mask";
    const description = sanitizeUserInput(body.description ?? "", mode);
    const observations = sanitizeUserInput(body.observations ?? "", mode);

    if (mode === "reject" && (description.blocked || observations.blocked)) {
      return NextResponse.json(
        {
          ok: false,
          error: "contact_blocked",
          message:
            "Texto contém telefone, WhatsApp, e-mail, @usuário ou link externo. Remova antes de publicar.",
          description,
          observations,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      ok: true,
      description,
      observations,
    });
  } catch (cause) {
    return jsonApiError(400, {
      error: "britagrid_sanitize_failed",
      message: "Payload inválido para sanitização.",
      scope: "britagrid.equipment.POST",
      cause,
    });
  }
}
