"use client";

import dynamic from "next/dynamic";

export const LicensingEngineLazy = dynamic(
  () =>
    import("@/components/licensing-engine/LicensingEnginePanel").then((m) => ({
      default: m.LicensingEnginePanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-[480px] rounded-3xl bg-white/[0.04]" />
      </div>
    ),
  },
);
