"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { VaultFormulaItem } from "@/lib/vault/types";

type EncryptionStatusBadgeProps = {
  encryption: VaultFormulaItem["encryption"];
};

export function EncryptionStatusBadge({ encryption }: EncryptionStatusBadgeProps) {
  const t = useTranslations("ChemicalVault");
  const rotating = encryption.status === "aes256_rotating";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wide backdrop-blur-md",
        rotating
          ? "border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-100"
          : "border-emerald-400/30 bg-gradient-to-r from-emerald-500/25 to-cyan-500/10 text-emerald-100",
      ].join(" ")}
    >
      {rotating ? (
        <ShieldCheck className="h-3 w-3 animate-pulse" aria-hidden />
      ) : (
        <Lock className="h-3 w-3" aria-hidden />
      )}
      {t("encryptionAes256")}
    </span>
  );
}
