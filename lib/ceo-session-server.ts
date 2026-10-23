import { cookies } from "next/headers";

import { CEO_SESSION_COOKIE, verifyCeoSessionToken } from "@/lib/ceo-session";

/** Usar em Server Actions e Server Components (Node). */
export async function isCeoAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(CEO_SESSION_COOKIE)?.value;
  return verifyCeoSessionToken(token);
}
