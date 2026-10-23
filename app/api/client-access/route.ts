import { NextRequest, NextResponse } from "next/server";

import { createClientAccessToken } from "@/lib/client-access-token";
import { FORMULAS } from "@/lib/formulas";
import { clientAccessBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";
import { SESSION_COOKIE_NAME, verifyGateToken } from "@/lib/vault-session";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifyGateToken(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = clientAccessBodySchema.safeParse(raw);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const formulaId = parsed.data.formulaId;
  if (!FORMULAS.some((f) => f.id === formulaId)) {
    return NextResponse.json({ error: "Invalid formula" }, { status: 400 });
  }

  const token = await createClientAccessToken(formulaId);
  return NextResponse.json({ token });
}
