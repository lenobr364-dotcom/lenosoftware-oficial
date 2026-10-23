"use client";

import { useCallback, useState } from "react";

export type ChemistrySimulationPoint = {
  tempo: number;
  estabilidade: number;
};

export function useChemistrySimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<ChemistrySimulationPoint[]>([]);

  const runSimulation = useCallback((temp: number, agite: number) => {
    setIsSimulating(true);
    const newResults: ChemistrySimulationPoint[] = [];

    for (let t = 0; t <= 60; t += 10) {
      const fatorRisco = temp * 0.5 + agite * 0.1;
      const estabilidade = Math.max(0, 100 - t * (fatorRisco / 50));
      newResults.push({ tempo: t, estabilidade: Number(estabilidade.toFixed(2)) });
    }

    setResults(newResults);
    window.setTimeout(() => setIsSimulating(false), 1000);
  }, []);

  return { runSimulation, results, isSimulating };
}
