"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { LabShellSkeleton } from "@/components/lab/LabShellSkeleton";
import { LabDataProvider } from "@/providers/LabDataProvider";
import { LabIntelligenceProvider } from "@/providers/LabIntelligenceProvider";

const LabAmbientBackdrop = dynamic(
  () => import("@/components/lab/LabAmbientBackdrop").then((m) => m.LabAmbientBackdrop),
  { ssr: false },
);

const LabTopNav = dynamic(
  () => import("@/components/lab/LabTopNav").then((m) => m.LabTopNav),
  { loading: () => <header className="h-14" aria-hidden /> },
);

const LabMobileNav = dynamic(
  () => import("@/components/lab/LabMobileNav").then((m) => m.LabMobileNav),
  { ssr: false },
);

export type LabDashboardClientShellProps = {
  children: ReactNode;
};

/** Shell do lab com lazy chunks, atestação QG e providers de dados. */
export function LabDashboardClientShell({ children }: LabDashboardClientShellProps) {
  useEffect(() => {
    void fetch("/api/nexus/lab/hq/attest", {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch(() => undefined);
  }, []);

  return (
    <LabDataProvider>
      <LabIntelligenceProvider>
        <div className="nx-lab-ambient relative min-h-screen text-white">
          <LabAmbientBackdrop />
          <LabTopNav />
          <main className="relative z-10 nx-animate-in pb-24 md:pb-12">{children}</main>
          <LabMobileNav />
        </div>
      </LabIntelligenceProvider>
    </LabDataProvider>
  );
}

export const LabControlPanelLazy = dynamic(
  () => import("@/components/lab/LabControlPanel").then((m) => ({ default: m.LabControlPanel })),
  { loading: () => <LabShellSkeleton /> },
);
