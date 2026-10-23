import { NextRequest, NextResponse } from "next/server";

import { requireCeoAndCoreLicense, type CeoCoreGuardOk } from "@/lib/api-dashboard-write-guard";

export type LabIntelligenceAccess =
  | ({ mode: "ceo" } & CeoCoreGuardOk)
  | { mode: "agent"; actorSubject: string };

/**
 * Acesso dual: sessão CEO + licença core (UI) ou Bearer CHEMVAULT_LAB_AGENT_SECRET (ferramentas IA).
 */
export async function requireLabIntelligenceAccess(
  request: NextRequest,
): Promise<LabIntelligenceAccess | NextResponse> {
  const secret = process.env.CHEMVAULT_LAB_AGENT_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";

  if (secret && token.length > 0) {
    if (token === secret) {
      return { mode: "agent", actorSubject: "lab-agent:bearer" };
    }
    return NextResponse.json({ error: "lab_agent_unauthorized" }, { status: 401 });
  }

  const ceo = await requireCeoAndCoreLicense(request);
  if (ceo instanceof NextResponse) return ceo;
  return { mode: "ceo", ...ceo };
}

/** Somente agente Bearer (webhooks / workers externos sem cookie). */
export function requireLabAgentSecretOnly(request: NextRequest): NextResponse | { ok: true } {
  const secret = process.env.CHEMVAULT_LAB_AGENT_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "lab_agent_not_configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (token !== secret) {
    return NextResponse.json({ error: "lab_agent_unauthorized" }, { status: 401 });
  }
  return { ok: true };
}
