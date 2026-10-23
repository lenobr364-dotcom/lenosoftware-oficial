"use client";

import { useTranslations } from "next-intl";

type ValidationStatusBadgeProps = {
  kind: "stability" | "compliance" | "regional" | "license" | "overall";
  status: string;
};

function tone(status: string): string {
  if (["stable", "approved", "active", "passed", "true", "ESTÁVEL"].includes(status)) {
    return "from-emerald-500/30 to-cyan-500/15 text-emerald-100 border-emerald-400/30";
  }
  if (["caution", "conditional", "renewal", "ALERTA_CRÍTICO"].includes(status)) {
    return "from-amber-500/25 to-orange-500/10 text-amber-100 border-amber-400/30";
  }
  return "from-rose-500/25 to-red-500/10 text-rose-100 border-rose-400/30";
}

export function ValidationStatusBadge({ kind, status }: ValidationStatusBadgeProps) {
  const t = useTranslations("FormulaSimulator");
  const labelKey = `${kind}Status_${status}` as Parameters<typeof t>[0];
  let label: string;
  try {
    label = t(labelKey);
  } catch {
    label = status;
  }

  return (
    <span
      className={[
        "inline-flex rounded-full border bg-gradient-to-r px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide",
        tone(status),
      ].join(" ")}
    >
      {label}
    </span>
  );
}
