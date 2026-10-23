import { NextRequest, NextResponse } from "next/server";

export function requireFormulaAgentSecret(request: NextRequest): NextResponse | { ok: true } {
  const secret = process.env.CHEMVAULT_FORMULA_AGENT_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "formula_agent_not_configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (token !== secret) {
    return NextResponse.json({ error: "formula_agent_unauthorized" }, { status: 401 });
  }
  return { ok: true };
}
