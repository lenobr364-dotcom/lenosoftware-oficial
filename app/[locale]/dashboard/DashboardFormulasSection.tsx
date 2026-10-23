import FormulaGrid from "@/components/FormulaGrid";
import { simulateOptionalLatency } from "@/lib/dev-latency";

export async function DashboardFormulasSection() {
  await simulateOptionalLatency("dashboard.formulas");
  return <FormulaGrid lazy />;
}
