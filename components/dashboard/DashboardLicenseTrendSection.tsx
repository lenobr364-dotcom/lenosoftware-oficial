import { LicenseGrowthGlassChart } from "@/app/components/dashboard/LicenseGrowthGlassChart";
import { getLicenseRequestTrend30d } from "@/lib/license-trend";

export async function DashboardLicenseTrendSection() {
  const points = await getLicenseRequestTrend30d();
  return <LicenseGrowthGlassChart points={points} />;
}
