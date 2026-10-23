import { LiveOperationsMapLazy } from "@/components/lab/map/LiveOperationsMapLazy";
import { isCeoAuthenticated } from "@/lib/ceo-session-server";
import { redirect } from "next/navigation";

export default async function LiveOperationsMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(await isCeoAuthenticated())) {
    redirect(`/${locale}/login`);
  }

  return <LiveOperationsMapLazy />;
}
