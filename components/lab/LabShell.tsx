import type { ReactNode } from "react";
import { LabAmbientBackdrop } from "./LabAmbientBackdrop";

export type LabShellProps = {
  children: ReactNode;
};

export function LabShell({ children }: LabShellProps) {
  return (
    <div className="nx-lab-ambient relative min-h-screen text-white">
      <LabAmbientBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
