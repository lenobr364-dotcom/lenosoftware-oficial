"use client";

import dynamic from "next/dynamic";

export const DigitalLabLazy = dynamic(
  () => import("@/components/digital-laboratory/DigitalLaboratoryShell").then((m) => ({ default: m.DigitalLaboratoryShell })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-400/30 border-t-cyan-300" />
      </div>
    ),
  },
);

