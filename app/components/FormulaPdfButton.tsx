"use client";

import { downloadFormulaPdf, type FormulaPdfLabels } from "@/lib/generate-formula-pdf";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

type Props = {
  className?: string;
  formulaName: string;
  code: string;
  composition: string;
  mixingInstructions: string;
  locale: string;
  labels: FormulaPdfLabels;
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-400/40 bg-gradient-to-r from-yellow-500/90 to-amber-400/90 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_28px_rgba(250,204,21,0.35)] transition hover:brightness-110 print:hidden disabled:cursor-wait disabled:opacity-70";

function formatIssuedAt(locale: string) {
  const tag =
    locale === "pt" ? "pt-BR" : locale === "de" ? "de-DE" : locale === "hi" ? "hi-IN" : "en-GB";
  return new Intl.DateTimeFormat(tag, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

export function FormulaPdfButton({
  className,
  formulaName,
  code,
  composition,
  mixingInstructions,
  locale,
  labels,
}: Props) {
  const t = useTranslations("FormulaDetail");
  const [busy, setBusy] = useState(false);

  const onExport = useCallback(() => {
    setBusy(true);
    try {
      downloadFormulaPdf({
        formulaName,
        code,
        composition,
        mixingInstructions,
        issuedAtFormatted: formatIssuedAt(locale),
        labels,
      });
    } finally {
      setBusy(false);
    }
  }, [code, composition, formulaName, labels, locale, mixingInstructions]);

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={busy}
      className={[baseClass, className].filter(Boolean).join(" ")}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
      {busy ? t("pdfGenerating") : t("pdfButton")}
    </button>
  );
}
