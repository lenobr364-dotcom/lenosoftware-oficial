"use client";

import { EncryptionStatusBadge } from "@/components/vault/EncryptionStatusBadge";
import { SecureDownloadButton } from "@/components/vault/SecureDownloadButton";
import { VaultDownloadBlockOverlay } from "@/components/vault/VaultDownloadBlockOverlay";
import type { VaultFormulaItem } from "@/lib/vault/types";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type GlassFormulaVaultCardProps = {
  item: VaultFormulaItem;
  coords: { lat: number; lng: number } | null;
  onBlocked: (reason: VaultFormulaItem["blockReason"]) => void;
};

export function GlassFormulaVaultCard({ item, coords, onBlocked }: GlassFormulaVaultCardProps) {
  const t = useTranslations("ChemicalVault");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [blockReason, setBlockReason] = useState(item.blockReason);

  async function handleDownload() {
    if (!item.downloadReady) {
      setBlockReason(item.blockReason);
      setShowBlock(true);
      onBlocked(item.blockReason);
      window.setTimeout(() => setShowBlock(false), 3200);
      return;
    }

    setBusy(true);
    setShowBlock(false);
    try {
      const res = await fetch("/api/dashboard/vault/download", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaId: item.id,
          locale,
          coordinates: coords,
        }),
      });

      if (res.status === 403) {
        const json = (await res.json()) as { reason?: VaultFormulaItem["blockReason"] };
        const reason = json.reason ?? "license_pending";
        setBlockReason(reason);
        setShowBlock(true);
        onBlocked(reason);
        window.setTimeout(() => setShowBlock(false), 3200);
        return;
      }

      if (!res.ok) return;

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? item.fileLabel;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={[
        "relative overflow-hidden rounded-3xl border p-5 shadow-[0_18px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1",
        item.downloadReady
          ? "border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.04] to-black/20"
          : "border-white/10 bg-white/[0.03]",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/[0.07] blur-2xl"
        aria-hidden
      />
      <VaultDownloadBlockOverlay reason={blockReason} visible={showBlock} />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/40">
            {t("cardLicensed")}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">{item.name}</h3>
          <p className="mt-0.5 nx-type-mono text-xs text-amber-200/60">{item.code}</p>
        </div>
        <EncryptionStatusBadge encryption={item.encryption} />
      </div>

      <dl className="relative mt-4 grid grid-cols-2 gap-2 text-xs text-white/45">
        <div>
          <dt className="uppercase tracking-wider">{t("cardFile")}</dt>
          <dd className="mt-0.5 nx-type-mono text-white/70">{item.fileLabel}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider">{t("cardSize")}</dt>
          <dd className="mt-0.5 text-white/70">{item.sizeHint}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider">{t("cardKeyId")}</dt>
          <dd className="mt-0.5 nx-type-mono text-white/55">{item.encryption.keyId}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider">{t("cardUpdated")}</dt>
          <dd className="mt-0.5 text-white/55">
            {new Date(item.lastUpdated).toLocaleDateString(locale)}
          </dd>
        </div>
      </dl>

      <div className="relative mt-5">
        <SecureDownloadButton ready={item.downloadReady} busy={busy} onDownload={() => void handleDownload()} />
      </div>
    </article>
  );
}
