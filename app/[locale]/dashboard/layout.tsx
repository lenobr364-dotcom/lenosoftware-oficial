import { DashboardRestrictedLayout } from "@/app/components/DashboardRestrictedLayout";
import { getLocale } from "next-intl/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <DashboardRestrictedLayout locale={locale}>{children}</DashboardRestrictedLayout>;
}