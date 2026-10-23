"use client";

import dynamic from "next/dynamic";

export const ChemicalVaultLazy = dynamic(
  () =>
    import("@/components/vault/ChemicalVaultPanel").then((m) => ({
      default: m.ChemicalVaultPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    ),
  },
);
