import { LabControlPanelLazy } from "@/components/lab/LabDashboardClientShell";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { redirect } from "next/navigation";

export default async function LaboratorioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  return <LabControlPanelLazy />;
}
