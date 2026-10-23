"use client";

import { Download, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

type SecureDownloadButtonProps = {
  ready: boolean;
  busy: boolean;
  onDownload: () => void;
};

export function SecureDownloadButton({ ready, busy, onDownload }: SecureDownloadButtonProps) {
  const t = useTranslations("ChemicalVault");

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onDownload}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40",
        ready
          ? "border-amber-400/35 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/15 text-amber-50 backdrop-blur-xl hover:border-amber-300/50 hover:shadow-[0_0_28px_rgba(251,191,36,0.2)]"
          : "border-white/10 bg-white/[0.04] text-white/40 backdrop-blur-md",
      ].join(" ")}
    >
      {!ready ? (
        <span className="pointer-events-none absolute inset-0 backdrop-blur-[2px] bg-black/25" aria-hidden />
      ) : null}
      {ready ? (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden
        />
      ) : null}
      <span className="relative inline-flex items-center justify-center gap-2">
        {ready ? (
          <Download className={`h-4 w-4 ${busy ? "animate-bounce" : ""}`} aria-hidden />
        ) : (
          <Lock className="h-4 w-4" aria-hidden />
        )}
        {busy ? t("downloading") : ready ? t("downloadSecure") : t("downloadLocked")}
      </span>
    </button>
  );
}
