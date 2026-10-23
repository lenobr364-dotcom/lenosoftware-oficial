"use server";

import { CEO_SESSION_COOKIE } from "@/lib/ceo-session";
import { routing } from "@/i18n/routing";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutCeo(formData: FormData) {
  const localeRaw = formData.get("locale");
  const raw = typeof localeRaw === "string" ? localeRaw.toLowerCase() : "en";
  const locale = routing.locales.includes(raw as (typeof routing.locales)[number]) ? raw : routing.defaultLocale;

  const jar = await cookies();
  jar.set(CEO_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  redirect(`/${locale}/login`);
}
