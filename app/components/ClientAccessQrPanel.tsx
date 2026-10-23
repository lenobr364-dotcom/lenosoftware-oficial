"use client";

import { GlassSkeletonLine } from "@/app/components/skeletons/glass-skeleton";
import { glassPanelDense, modalBackdropClass, modalBodyMutedClass, modalHintClass, modalPanelClass, modalTitleClass } from "@/lib/ui-glass";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

type Props = {
  formulaId: string;
  formulaName: string;
  locale: string;
};

export function ClientAccessQrPanel({ formulaId, formulaName, locale }: Props) {
  const t = useTranslations("ClientAccess");
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessUrl = useMemo(() => {
    if (!token || typeof window === "undefined") return "";
    const path = `/${locale}/acesso/${encodeURIComponent(token)}`;
    return `${window.location.origin}${path}`;
  }, [locale, token]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await fetch("/api/client-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ formulaId }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }
      if (!data.token) {
        setError(t("errorGeneric"));
        return;
      }
      setToken(data.token);
      setOpen(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }, [formulaId, t]);

  const copyLink = useCallback(async () => {
    if (!accessUrl) return;
    try {
      await navigator.clipboard.writeText(accessUrl);
    } catch {
      /* ignore */
    }
  }, [accessUrl]);

  return (
    <div className="print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.18)] transition hover:border-emerald-300/50 hover:bg-emerald-500/25 disabled:opacity-60"
        >
          {loading ? t("generating") : t("openButton")}
        </button>
        {loading ? (
          <div className={`flex min-h-[3rem] flex-1 flex-col justify-center gap-2 rounded-2xl px-4 py-2 ${glassPanelDense}`} aria-busy="true">
            <GlassSkeletonLine className="h-2.5 w-full max-w-[12rem]" />
            <GlassSkeletonLine className="h-2.5 w-[70%] max-w-[10rem]" />
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}

      {open && token ? (
        <div
          className={modalBackdropClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-access-title"
          onClick={() => setOpen(false)}
        >
          <div className={`${modalPanelClass} border-yellow-500/20`} onClick={(e) => e.stopPropagation()}>
            <h2 id="client-access-title" className={modalTitleClass}>
              {t("modalTitle")}
            </h2>
            <p className={`mt-1 ${modalBodyMutedClass}`}>
              {formulaName} · <span className="font-mono text-yellow-200">{formulaId}</span>
            </p>
            <p className={modalHintClass}>{t("modalHint")}</p>

            <div className="mt-8 flex flex-col items-center rounded-2xl border border-yellow-500/20 bg-black/60 p-6">
              <QRCodeSVG
                value={accessUrl}
                size={220}
                level="M"
                includeMargin
                bgColor="transparent"
                fgColor="#fde68a"
              />
            </div>

            <p className="mt-6 break-all rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-[0.65rem] text-neutral-200/90">
              {accessUrl}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-xl border border-yellow-500/30 bg-yellow-500/10 py-3 text-xs font-semibold uppercase tracking-wider text-yellow-100 transition hover:bg-yellow-500/20"
              >
                {t("copyLink")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="flex-1 rounded-xl border border-white/15 py-3 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:bg-white/5"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
