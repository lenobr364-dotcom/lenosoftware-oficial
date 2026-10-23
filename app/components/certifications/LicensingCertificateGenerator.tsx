"use client";

import type { ProductLine } from "@/lib/product-line";
import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const panel = [
  "rounded-[2rem] border border-white/[0.09]",
  "bg-gradient-to-br from-white/[0.07] via-black/50 to-black/78",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_-10px_rgba(250,204,21,0.12)] backdrop-blur-2xl md:p-8",
].join(" ");

export type ApprovedLeadOption = {
  id: string;
  company: string;
  country: string;
  corporateEmail: string;
  status: string;
};

export type FormulaOption = {
  id: string;
  title: string;
  productLine: ProductLine;
};

export function LicensingCertificateGenerator({
  locale,
  approvedLeads,
  formulas,
}: {
  locale: string;
  approvedLeads: ApprovedLeadOption[];
  formulas: FormulaOption[];
}) {
  const t = useTranslations("CertificationsCenter");
  const [leadId, setLeadId] = useState(approvedLeads[0]?.id ?? "");
  const [formulaId, setFormulaId] = useState(formulas[0]?.id ?? "");

  const canGenerate = useMemo(() => Boolean(leadId && formulaId), [leadId, formulaId]);

  function openPdf() {
    if (!canGenerate) return;
    const q = new URLSearchParams({
      leadId,
      formulaId,
      locale,
    });
    const url = `/api/certifications/licensing-certificate?${q.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (approvedLeads.length === 0) {
    return (
      <section className={panel}>
        <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{t("generatorTitle")}</h2>
        <p className="mt-2 text-sm text-neutral-500">{t("generatorSubtitle")}</p>
        <p className="mt-6 rounded-2xl border border-dashed border-amber-500/25 bg-amber-500/5 px-4 py-8 text-center text-sm text-amber-100/85">
          {t("noApprovedLeads")}
        </p>
      </section>
    );
  }

  if (formulas.length === 0) {
    return (
      <section className={panel}>
        <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{t("generatorTitle")}</h2>
        <p className="mt-2 text-sm text-neutral-500">{t("generatorSubtitle")}</p>
        <p className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/40 px-4 py-8 text-center text-sm text-neutral-400">
          {t("noFormulas")}
        </p>
      </section>
    );
  }

  return (
    <section className={panel}>
      <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{t("generatorTitle")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">{t("generatorSubtitle")}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-200/75">
          {t("selectLead")}
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/35"
          >
            {approvedLeads.map((l) => (
              <option key={l.id} value={l.id} className="bg-neutral-900">
                {l.company} — {l.country}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-200/75">
          {t("selectFormula")}
          <select
            value={formulaId}
            onChange={(e) => setFormulaId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/35"
          >
            {formulas.map((f) => (
              <option key={f.id} value={f.id} className="bg-neutral-900">
                {f.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={openPdf}
          aria-label={t("generateAria")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/90 to-yellow-500/85 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_32px_rgba(250,204,21,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileDown className="h-4 w-4 stroke-[2]" aria-hidden />
          {t("generatePdf")}
        </button>
        <p className="max-w-xl text-[0.7rem] leading-relaxed text-neutral-600">{t("generatorHint")}</p>
      </div>
    </section>
  );
}
