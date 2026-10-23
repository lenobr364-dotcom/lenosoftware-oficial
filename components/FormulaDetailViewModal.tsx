"use client";

import type { Formula } from "@prisma/client";
import { glassButton, glassPanelDense } from "@/lib/ui-glass";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

type Props = {
  formula: Formula | null;
  onClose: () => void;
};

export function FormulaDetailViewModal({ formula, onClose }: Props) {
  const t = useTranslations("Dashboard.formulaGrid");

  useEffect(() => {
    if (!formula) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formula, onClose]);

  if (!formula) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
        aria-label={t("closeDetailAria")}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="formula-detail-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#D4AF37]/20 bg-[linear-gradient(165deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.04)_40%,rgba(3,5,12,0.72)_100%)] p-8 shadow-[0_0_60px_rgba(212,175,55,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[32px] ring-1 ring-white/[0.06]"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#D4AF37]/15 blur-3xl" />

        <header className="relative mb-8 flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/12 text-[#D4AF37] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]/80">{t("detailViewEyebrow")}</p>
            <h2 id="formula-detail-title" className="mt-2 text-2xl font-bold tracking-tight text-white">
              {formula.nome}
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">{formula.categoria}</p>
          </div>
        </header>

        <div className="relative space-y-4">
          <section className={`p-4 ${glassPanelDense}`}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/90">{t("detailComposition")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{t("detailPlaceholder")}</p>
          </section>
          <section className={`p-4 ${glassPanelDense}`}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/90">{t("detailReaction")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{t("detailPlaceholder")}</p>
          </section>
          <section className={`p-4 ${glassPanelDense}`}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/90">{t("detailCerts")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{t("detailPlaceholder")}</p>
          </section>
        </div>

        <footer className="relative mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={`w-full py-3.5 text-xs font-bold uppercase tracking-widest sm:w-auto ${glassButton}`}>
            {t("closeDetail")}
          </button>
        </footer>
      </div>
    </div>
  );
}
