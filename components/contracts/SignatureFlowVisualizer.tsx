"use client";

import type { LicensingContractRow, SignatureStepId } from "@/lib/contracts/types";
import { Check, FileText, Link2, PenLine, Send } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS: SignatureStepId[] = [
  "draft",
  "terms_generated",
  "awaiting_signature",
  "signed",
  "anchored",
];

const STEP_ICON: Record<SignatureStepId, typeof FileText> = {
  draft: FileText,
  terms_generated: FileText,
  awaiting_signature: Send,
  signed: PenLine,
  anchored: Link2,
};

function stepIndex(step: SignatureStepId): number {
  return STEPS.indexOf(step);
}

export function SignatureFlowVisualizer({ contract }: { contract: LicensingContractRow }) {
  const t = useTranslations("LicensingContracts");
  const current = stepIndex(contract.signature.currentStep);

  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl"
      aria-label={t("signatureFlowAria")}
    >
      <p className="nx-type-eyebrow mb-4 text-[0.58rem]">{t("signatureFlowTitle")}</p>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {STEPS.map((step, idx) => {
          const done = idx <= current;
          const active = idx === current;
          const Icon = STEP_ICON[step];
          return (
            <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur-md transition",
                  done
                    ? "border-cyan-400/35 bg-gradient-to-br from-cyan-500/30 to-violet-500/20 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-white/30",
                  active ? "ring-2 ring-cyan-400/40" : "",
                ].join(" ")}
              >
                {done && idx < current ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden />
                )}
              </span>
              <span
                className={`text-[0.62rem] font-semibold uppercase tracking-wide ${done ? "text-white/80" : "text-white/35"}`}
              >
                {t(`signatureStep_${step}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
