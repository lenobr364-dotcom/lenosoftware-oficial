"use client";

import CostAnalyzer from "@/components/CostAnalyzer";
import StabilityReport from "@/components/StabilityReport";
import { useChemistrySimulation } from "@/hooks/useChemistrySimulation";
import type { RawMaterial } from "@/lib/math/productionCosts";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LabSimulacao() {
  const { runSimulation, results, isSimulating } = useChemistrySimulation();
  const [temp, setTemp] = useState(25);
  const [agite, setAgite] = useState(100);

  const materiasPrimas: RawMaterial[] = [
    { name: "Glicerina Bi-destilada", pricePerUnit: 12.5, amountUsed: 0.5 },
    { name: "Ativo Tensoativo", pricePerUnit: 18.2, amountUsed: 0.2 },
    { name: "Essência Premium", pricePerUnit: 45.0, amountUsed: 0.05 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter text-white">
          LABORATÓRIO <span className="text-amber-500">DIGITAL</span>
        </h1>
        <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-gray-500">
          Simulação Técnica e Financeira Integrada • ChemVault
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-8 text-[10px] font-bold uppercase tracking-widest text-amber-500">Ajuste de Variáveis</h3>
            <div className="space-y-8">
              <div>
                <label className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                  Temperatura <span>{temp}°C</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                  Agitação <span>{agite} RPM</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={agite}
                  onChange={(e) => setAgite(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => runSimulation(temp, agite)}
                disabled={isSimulating}
                className="w-full rounded-2xl bg-amber-500 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-white disabled:opacity-60"
              >
                {isSimulating ? "Simulando Reação..." : "Executar Simulação"}
              </button>
            </div>
          </div>

          <CostAnalyzer materials={materiasPrimas} />
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl lg:col-span-2">
          <div className="mt-4 h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="tempo" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid #333",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="estabilidade"
                  stroke="#f59e0b"
                  strokeWidth={4}
                  dot={{ fill: "#f59e0b", r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {results.length > 0 && (
            <StabilityReport formulaName="Sabão Glicerinado Premium" data={results} />
          )}
        </div>
      </div>
    </div>
  );
}
