"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type FrostCodeBlockProps = {
  code: string;
  label?: string;
  className?: string;
};

export function FrostCodeBlock({ code, label, className = "" }: FrostCodeBlockProps) {
  const t = useTranslations("ApiIntegration");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border border-white/12",
        "bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-cyan-500/[0.04]",
        "backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      ].join(" ")}
    >
      {label ? (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{label}</span>
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[0.65rem] font-medium text-white/60 transition hover:border-cyan-400/30 hover:text-white"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
      ) : null}
      <pre className="max-h-[28rem] overflow-auto p-4 text-xs leading-relaxed text-cyan-50/90">
        <code className="nx-type-mono whitespace-pre-wrap break-all">{code}</code>
      </pre>
    </div>
  );
}
