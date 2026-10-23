"use client";

import dynamic from "next/dynamic";

export const ComplianceLazy = dynamic(
  () => import("@/components/compliance/CompliancePanel").then((m) => ({ default: m.CompliancePanel })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[24rem] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-300" />
      </div>
    ),
  },
);

