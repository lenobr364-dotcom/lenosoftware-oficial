import { NextRequest, NextResponse } from "next/server";

import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";

export async function requireCeoApiSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(CEO_SESSION_COOKIE)?.value;
  if (!(await verifyCeoSessionToken(token))) {
    return NextResponse.json({ ok: false, error: "ceo_session_required" }, { status: 401 });
  }
  return null;
}
