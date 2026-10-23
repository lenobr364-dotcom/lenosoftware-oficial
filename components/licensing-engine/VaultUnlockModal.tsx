"use client";

import type { DecryptPayloadSuccess } from "@/lib/licensing/api-types";
import { Link } from "@/i18n/navigation";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

type VaultUnlockModalProps = {
  open: boolean;
  result: DecryptPayloadSuccess | null;
  onClose: () => void;
};

export function VaultUnlockModal({ open, result, onClose }: VaultUnlockModalProps) {
  const t = useTranslations("SmartLicensingEngine");

  if (!open || !result) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        aria-label={t("unlockClose")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vault-unlock-title"
        className="fixed left-1/2 top-1/2 z-[61] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-cyan-400/25 bg-[#060a12]/95 p-5 shadow-[0_32px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/70">
              {t("unlockEyebrow")}
            </p>
            <h2 id="vault-unlock-title" className="mt-1 text-lg font-semibold text-white">
              {t("unlockTitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <p className="text-sm text-white/55">{t("unlockSubtitle", { seconds: result.expiresInSeconds })}</p>

        <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-white/40">{t("unlockTokenLabel")}</p>
          <p className="nx-type-mono break-all text-[0.65rem] leading-relaxed text-cyan-100/75">{result.accessToken}</p>
          <p className="text-xs text-white/40">
            {t("unlockExpires", { at: new Date(result.expiresAt).toLocaleString() })}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-violet-200/80">
            {t("unlockPayloadLabel")}
          </p>
          <p className="mt-1 nx-type-mono text-[0.65rem] text-white/50">
            {result.encryptedPayload.algorithm} · {result.encryptedPayload.formulaCode}
          </p>
          <p className="mt-1 truncate text-[0.65rem] text-white/35">
            {t("unlockCiphertextHint", { bytes: result.encryptedPayload.ciphertext.length })}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={result.vaultDownloadHint}
            className="inline-flex rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-500/25"
          >
            {t("unlockOpenVault")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            {t("unlockClose")}
          </button>
        </div>
      </div>
    </>
  );
}
