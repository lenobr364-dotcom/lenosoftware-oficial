"use server";

import { routing } from "@/i18n/routing";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUSES = new Set(["Pendente", "Em Análise", "Aprovado", "REJECTED"]);

export type LicenseRequestStatusAction = "Pendente" | "Em Análise" | "Aprovado" | "REJECTED";

export type UpdateLicenseRequestResult = { ok: true } | { ok: false; error: string };

export async function updateLicenseRequestStatus(
  leadId: string,
  nextStatus: LicenseRequestStatusAction,
): Promise<UpdateLicenseRequestResult> {
  if (!(await isCeoAuthenticated())) {
    return { ok: false, error: "Unauthorized." };
  }

  if (!leadId || typeof leadId !== "string") {
    return { ok: false, error: "Invalid id" };
  }

  const trimmed = nextStatus.trim();
  if (!ALLOWED_STATUSES.has(trimmed)) {
    return { ok: false, error: "Invalid status" };
  }

  try {
    const updatedRequest = await prisma.licenseRequest.update({
      where: { id: leadId },
      data: { status: trimmed },
      select: { status: true, corporateEmail: true, company: true },
    });

    if (updatedRequest.status === "Aprovado") {
      console.log("\n=======================================");
      console.log("[SISTEMA CHEMVAULT] GATILHO DE E-MAIL ACIONADO");
      console.log(`[DESTINO]: ${updatedRequest.corporateEmail}`);
      console.log(`[MENSAGEM]: Licença para ${updatedRequest.company} APROVADA com sucesso.`);
      console.log("=======================================\n");
    }
  } catch {
    return { ok: false, error: "Could not update license request." };
  }

  for (const loc of routing.locales) {
    revalidatePath(`/${loc}/dashboard`);
    revalidatePath(`/${loc}/dashboard/leads`);
  }

  return { ok: true };
}
