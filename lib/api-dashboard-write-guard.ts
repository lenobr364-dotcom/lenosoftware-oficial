import { NextRequest, NextResponse } from "next/server";

import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";
import { CORE_LICENSE_COOKIE, getCoreLicenseSubjectIfValid } from "@/lib/core-license-session";

export type CeoCoreGuardOk = { actorSubject: string };

export async function requireCeoAndCoreLicense(
  request: NextRequest,
): Promise<CeoCoreGuardOk | NextResponse> {
  const ceo = request.cookies.get(CEO_SESSION_COOKIE)?.value;
  if (!(await verifyCeoSessionToken(ceo))) {
    return NextResponse.json({ error: "ceo_session_required" }, { status: 401 });
  }
  const actorSubject = await getCoreLicenseSubjectIfValid(request.cookies.get(CORE_LICENSE_COOKIE)?.value);
  if (!actorSubject) {
    return NextResponse.json({ error: "core_license_required" }, { status: 401 });
  }
  return { actorSubject };
}
