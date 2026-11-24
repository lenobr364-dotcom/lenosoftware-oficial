import { ShieldAlert } from "lucide-react";

import {
  ANTI_DISINTERMEDIATION_NOTICE,
  LENO_OPERATOR,
} from "@/lib/anti-disintermediation/exclusivity-terms";

type Props = {
  compact?: boolean;
};

export function AntiDisintermediationBanner({ compact = false }: Props) {
  return (
    <aside
      role="note"
      className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-amber-50/90"
    >
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden />
        <div className="space-y-1.5 text-sm leading-relaxed">
          <p className="font-semibold tracking-wide text-amber-100">
            Proteção anti-desintermediação — {LENO_OPERATOR.brand}
          </p>
          {!compact && <p className="text-amber-50/80">{ANTI_DISINTERMEDIATION_NOTICE}</p>}
          {compact && (
            <p className="text-amber-50/80">
              Troca de contato direto antes da liberação viola os termos e sujeita a conta a
              bloqueio/multa. Operação: {LENO_OPERATOR.holding} · CNPJ {LENO_OPERATOR.cnpj}.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
