"use client";

import dynamic from "next/dynamic";

export const ApiIntegrationLazy = dynamic(
  () =>
    import("@/components/gateway/ApiIntegrationPanel").then((m) => ({
      default: m.ApiIntegrationPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-[28rem] rounded-3xl bg-white/[0.04]" />
      </div>
    ),
  },
);
