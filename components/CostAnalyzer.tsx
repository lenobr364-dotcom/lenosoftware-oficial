"use client";

import { calculateProductionCost, type RawMaterial } from "@/lib/math/productionCosts";

type Props = {
  materials: RawMaterial[];
};

export default function CostAnalyzer({ materials }: Props) {
  const costs = calculateProductionCost(materials);

  return (
    <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-inner backdrop-blur-3xl">
      <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
        Análise de Viabilidade Econômica
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="mb-1 text-[9px] font-bold uppercase text-gray-500">Custo Direto</p>
          <p className="font-mono text-xl text-white">R$ {costs.directCost}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="mb-1 text-[9px] font-bold uppercase text-gray-500">Custo Total (+OPEX)</p>
          <p className="font-mono text-xl text-white">R$ {costs.totalCost}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="mb-1 text-[9px] font-bold uppercase text-amber-500">Preço Sugerido</p>
          <p className="font-mono text-xl text-amber-500">R$ {costs.suggestedPrice}</p>
        </div>
      </div>

      <p className="mt-4 text-[9px] italic text-gray-600">
        *Estimativa baseada em impostos e custos operacionais padrão para o setor químico.
      </p>
    </div>
  );
}
