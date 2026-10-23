"use client";

import dynamic from "next/dynamic";

export const SimulationHubLazy = dynamic(
  () =>
    import("@/components/simulation-hub/SimulationHubPanel").then((m) => ({
      default: m.SimulationHubPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[28rem] rounded-3xl bg-white/[0.04]" />
          <div className="h-[28rem] rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    ),
  },
);
