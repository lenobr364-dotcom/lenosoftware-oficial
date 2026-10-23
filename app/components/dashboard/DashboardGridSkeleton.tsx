import { glassPanelDense } from "@/lib/ui-glass";

/** Skeleton para grelha de fórmulas / painel (latências altas). */
export function DashboardGridSkeleton() {
  const pulse = "animate-pulse";
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading">
      <div
        className={`h-12 w-full max-w-md rounded-xl border border-white/[0.1] bg-white/[0.06] backdrop-blur-2xl md:w-96 ${pulse}`}
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`p-8 ${glassPanelDense} ${pulse}`}>
            <div className="mb-6 h-6 w-24 rounded-full bg-white/[0.1]" />
            <div className="mb-3 h-8 max-w-[14rem] w-[85%] rounded-lg bg-white/[0.08]" />
            <div className="mb-2 h-3 w-full rounded bg-white/[0.07]" />
            <div className="mb-8 h-3 w-[92%] rounded bg-white/[0.06]" />
            <div className="h-11 w-full rounded-xl bg-white/[0.1]" />
          </div>
        ))}
      </div>
    </div>
  );
}
