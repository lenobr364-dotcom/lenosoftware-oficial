import { LabDashboardClientShell } from "@/components/lab/LabDashboardClientShell";
import type { ReactNode } from "react";

export type LabDashboardLayoutProps = {
  children: ReactNode;
};

export function LabDashboardLayout({ children }: LabDashboardLayoutProps) {
  return <LabDashboardClientShell>{children}</LabDashboardClientShell>;
}
