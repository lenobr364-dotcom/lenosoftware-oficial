import type { ContractDisplayStatus } from "@/lib/contracts/types";
import { useTranslations } from "next-intl";

const STATUS_CLASS: Record<ContractDisplayStatus, string> = {
  active:
    "border-emerald-400/30 bg-gradient-to-r from-emerald-500/25 to-cyan-500/15 text-emerald-100",
  pending:
    "border-amber-400/30 bg-gradient-to-r from-amber-500/25 to-orange-500/10 text-amber-100",
  expired:
    "border-rose-400/25 bg-gradient-to-r from-rose-500/20 to-violet-500/10 text-rose-100/90",
  revoked:
    "border-white/15 bg-gradient-to-r from-white/10 to-white/5 text-white/50",
};

export function ContractStatusBadge({ status }: { status: ContractDisplayStatus }) {
  const t = useTranslations("LicensingContracts");
  const key = `status_${status}` as const;

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide backdrop-blur-md",
        STATUS_CLASS[status],
      ].join(" ")}
    >
      {t(key)}
    </span>
  );
}
