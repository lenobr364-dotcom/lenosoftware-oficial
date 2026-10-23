"use client";

import dynamic from "next/dynamic";

export const LiveOperationsMapLazy = dynamic(
  () => import("@/components/lab/map/LiveOperationsMap").then((m) => ({ default: m.LiveOperationsMap })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[100rem] animate-pulse px-5 py-8 sm:px-8">
        <div className="mb-6 h-28 rounded-3xl bg-white/5" />
        <div className="min-h-[min(72vh,640px)] rounded-3xl bg-white/[0.04]" />
      </div>
    ),
  },
);
