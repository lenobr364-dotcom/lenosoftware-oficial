"use client";

import { checkCompliance, type Ingredient } from "@/lib/chemistry/compliance";
import { glassButton, glassPanel, glassPanelDense } from "@/lib/ui-glass";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  formulaName: string;
}

export default function ComplianceModal({ isOpen, onClose, ingredients, formulaName }: Props) {
  if (!isOpen) return null;

  const { isCompliant, violations } = checkCompliance(ingredients);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} aria-hidden />

      <div className={`relative z-10 w-full max-w-lg overflow-hidden p-8 ${glassPanel}`}>
        <div
          className={`absolute -right-24 -top-24 h-48 w-48 rounded-full blur-[80px] opacity-20 ${isCompliant ? "bg-emerald-500" : "bg-amber-500"}`}
        />

        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">{formulaName}</h2>
          <p className="mt-1 text-sm font-semibold uppercase italic tracking-widest text-gray-500">
            ChemVault Intelligence Audit
          </p>
        </header>

        <main className="space-y-6">
          <div
            className={`flex items-center gap-4 p-4 ${glassPanelDense} ${isCompliant ? "border-emerald-500/25 ring-emerald-500/15" : "border-amber-500/25 ring-amber-500/15"}`}
          >
            <div className={`h-3 w-3 animate-ping rounded-full ${isCompliant ? "bg-emerald-400" : "bg-amber-400"}`} />
            <p className={`text-xs font-bold uppercase tracking-widest ${isCompliant ? "text-emerald-400" : "text-amber-400"}`}>
              {isCompliant ? "Global Compliance: Approved" : "Global Compliance: Alert"}
            </p>
          </div>

          {!isCompliant && (
            <div className="space-y-4">
              {violations.map((v, i) => (
                <div key={i} className={`p-4 ${glassPanelDense}`}>
                  <p className="mb-1 text-sm font-bold text-white">{v.ingredient}</p>
                  <p className="text-xs leading-relaxed text-gray-500">{v.message}</p>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-10">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-4 text-xs font-bold uppercase tracking-widest ${glassButton} hover:border-amber-200/30 hover:bg-amber-500/20 hover:text-white`}
          >
            Fechar Relatório
          </button>
        </footer>
      </div>
    </div>
  );
}
