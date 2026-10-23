import { timingSafeEqual } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import { finalizeCeoLoginSession } from "@/lib/ceo-login-finalize";
import { normalizeAdminEmail } from "@/lib/ceo-session";
import { ceoAuthBodySchema } from "@/lib/validation/api-schemas";

/** Credenciais do Diretor — override via DIRETORIA_AUTH_EMAIL / DIRETORIA_AUTH_PASSWORD em produção. */
const DEFAULT_EMAIL = "lenobr364@gmail.com";
const DEFAULT_PASSWORD = "Pistaod8t#";
const BLINDAGEM_DELAY_MS = 1000;

function safeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, BLINDAGEM_DELAY_MS));

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false as const, error: "Credenciais Inválidas" }, { status: 401 });
  }

  const parsed = ceoAuthBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Credenciais Inválidas" }, { status: 401 });
  }

  const allowedEmail = normalizeAdminEmail(process.env.DIRETORIA_AUTH_EMAIL ?? DEFAULT_EMAIL);
  const allowedPassword = process.env.DIRETORIA_AUTH_PASSWORD ?? DEFAULT_PASSWORD;

  const emailOk = safeEqualString(normalizeAdminEmail(parsed.data.email), allowedEmail);
  const passwordOk = safeEqualString(parsed.data.password, allowedPassword);

  if (!emailOk || !passwordOk) {
    return NextResponse.json({ ok: false as const, error: "Credenciais Inválidas" }, { status: 401 });
  }

  return finalizeCeoLoginSession(request, allowedEmail);
}
