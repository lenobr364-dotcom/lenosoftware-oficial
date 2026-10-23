import { LabDashboardLayout } from "@/components/lab/LabDashboardLayout";
import type { ReactNode } from "react";

export default function GeminiLabLayout({ children }: { children: ReactNode }) {
  return <LabDashboardLayout>{children}</LabDashboardLayout>;
}
