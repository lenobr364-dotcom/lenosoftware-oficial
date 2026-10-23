"use client";

import dynamic from "next/dynamic";

export const FormulaSimulatorLazy = dynamic(
  () =>
    import("@/components/simulator/FormulaSimulatorPanel").then((m) => ({
      default: m.FormulaSimulatorPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 rounded-3xl bg-white/[0.04]" />
          <div className="h-80 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    ),
  },
);
