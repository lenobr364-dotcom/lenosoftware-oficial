"use client";

import type { ComplianceCertificatePayload } from "@/lib/compliance/types";
import { Copy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

type CertificatePreviewModalProps = {
  certificate: ComplianceCertificatePayload | null;
  onClose: () => void;
};

export function CertificatePreviewModal({ certificate, onClose }: CertificatePreviewModalProps) {
  const t = useTranslations("ComplianceExport");
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }, []);

  if (!certificate) return null;

  const json = JSON.stringify(certificate, null, 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={t("certModalClose")}
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#0a0f18]/95 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="nx-type-eyebrow text-[0.58rem] text-cyan-300/80">{t("certModalEyebrow")}</p>
            <h2 id="cert-modal-title" className="mt-1 text-lg font-semibold text-white">
              {t("certModalTitle")}
            </h2>
            <p className="mt-1 text-xs text-white/45">{certificate.documentId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/12 bg-white/5 p-2 text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3">
              <p className="text-[0.62rem] uppercase tracking-wider text-white/45">{t("certDigestLabel")}</p>
              <p className="nx-type-mono mt-1 break-all text-xs text-emerald-100/90">
                {certificate.regulatory.documentDigest}
              </p>
              <button
                type="button"
                onClick={() => void copyText("digest", certificate.regulatory.documentDigest)}
                className="mt-2 inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-wider text-cyan-200/80 hover:text-cyan-100"
              >
                <Copy className="h-3 w-3" aria-hidden />
                {copied === "digest" ? t("certCopied") : t("certCopy")}
              </button>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-3">
              <p className="text-[0.62rem] uppercase tracking-wider text-white/45">{t("certVerificationLabel")}</p>
              <p className="nx-type-mono mt-1 break-all text-xs text-violet-100/90">
                {certificate.regulatory.verificationKey}
              </p>
              <button
                type="button"
                onClick={() => void copyText("key", certificate.regulatory.verificationKey)}
                className="mt-2 inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-wider text-cyan-200/80 hover:text-cyan-100"
              >
                <Copy className="h-3 w-3" aria-hidden />
                {copied === "key" ? t("certCopied") : t("certCopy")}
              </button>
            </div>
          </div>

          <pre className="max-h-64 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-3 text-[0.65rem] leading-relaxed text-cyan-100/80">
            {json}
          </pre>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText("json", json)}
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-100 hover:bg-cyan-500/25"
            >
              {copied === "json" ? t("certCopied") : t("certCopyJson")}
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${certificate.documentId}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10"
            >
              {t("certDownloadJson")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


