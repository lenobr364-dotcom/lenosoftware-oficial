"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VaultDownloadBlockReason } from "@/lib/vault/types";

type VaultDownloadBlockOverlayProps = {
  reason: VaultDownloadBlockReason;
  visible: boolean;
};

export function VaultDownloadBlockOverlay({ reason, visible }: VaultDownloadBlockOverlayProps) {
  const t = useTranslations("ChemicalVault");

  if (!visible || reason === "none") return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl border border-rose-500/40 bg-rose-950/80 p-6 backdrop-blur-xl transition-opacity duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="vault-block-title"
    >
      <div className="max-w-xs text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/35 bg-rose-500/20 shadow-[0_0_32px_rgba(244,63,94,0.35)]">
          <ShieldAlert className="h-7 w-7 animate-pulse text-rose-200" aria-hidden />
        </span>
        <p id="vault-block-title" className="mt-4 text-sm font-semibold text-rose-50">
          {t("blockTitle")}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-rose-100/75">
          {t(`blockReason_${reason}` as Parameters<typeof t>[0])}
        </p>
        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-rose-200/50">{t("blockSecureHold")}</p>
      </div>
    </div>
  );
}
