"use client";

import { Lock, RefreshCw, ShieldAlert, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { useRouter } from "@/i18n/navigation";

/**
 * Demo gate client-side: simula latência de processamento e injeta os cookies
 * `role=CEO` + `license=core` que o middleware (matchLumenLabRoute) verifica
 * para liberar /laboratorio + /dashboard/chemical-vault + /dashboard/formula-simulator.
 *
 * Não chama o backend; a auth real via POST /api/auth/login + HMAC HttpOnly
 * cookies continua disponível mas não é exercitada por este form. Cookies
 * setados aqui são forjáveis no DevTools — adequado apenas para demo/portfólio.
 */
const LOGIN_DELAY_MS = 1500;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const authFailed = searchParams.get("auth_failed") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    window.setTimeout(() => {
      const sameSite = "Strict";
      const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
      document.cookie = `role=CEO; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=${sameSite}${secureFlag}`;
      document.cookie = `license=core; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=${sameSite}${secureFlag}`;
      router.push("/laboratorio");
      router.refresh();
    }, LOGIN_DELAY_MS);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f0d] p-4 font-mono text-[#e2e8f0] selection:bg-[#10b981] selection:text-black">
      <div className="relative w-full max-w-md overflow-hidden rounded border border-[#14291f] bg-[#0f1712] p-6 shadow-2xl">
        <div className="absolute left-0 top-0 h-[2px] w-full bg-[#10b981]" aria-hidden />

        <div className="mb-6 text-center">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            CHEMVAULT <span className="text-[#10b981]">{t("terminalBrandSuffix")}</span>
          </h2>
          <p className="mt-1 text-[10px] uppercase text-gray-500">{t("terminalSubtitle")}</p>
        </div>

        {authFailed && !isLoading ? (
          <div
            className="mb-6 flex animate-pulse items-start gap-3 rounded border border-[#10b981]/40 bg-[#092116] p-3"
            role="alert"
          >
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#10b981]" aria-hidden />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#10b981]">{t("authFailedTitle")}</div>
              <p className="mt-0.5 text-[11px] text-gray-400">{t("authFailedDescription")}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400"
            >
              {t("labelEmail")}
            </label>
            <div className="relative">
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={isLoading}
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder={t("userPlaceholder")}
                className="w-full rounded border border-[#14291f] bg-[#070b09] px-3 py-2 pl-9 text-xs text-white transition-colors focus:border-[#10b981] focus:outline-none disabled:opacity-60"
              />
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" aria-hidden />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400"
            >
              {t("labelPassword")}
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded border border-[#14291f] bg-[#070b09] px-3 py-2 pl-9 text-xs text-white transition-colors focus:border-[#10b981] focus:outline-none disabled:opacity-60"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" aria-hidden />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-[#10b981] py-2.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#0d9668] active:scale-[0.99] disabled:cursor-wait disabled:bg-[#14291f] disabled:text-gray-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                {t("submitLoading")}
              </>
            ) : (
              t("submit")
            )}
          </button>
        </form>
      </div>

      <div className="mt-4 text-[9px] uppercase tracking-widest text-gray-600">{t("systemTag")}</div>
    </main>
  );
}
