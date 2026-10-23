import { DashboardGridSkeleton } from "@/app/components/dashboard/DashboardGridSkeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white md:p-12">
      <header className="mx-auto mb-16 flex max-w-7xl flex-col items-end justify-between gap-6 md:flex-row">
        <div className="w-full max-w-xl space-y-3">
          <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-white/[0.07]" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-white/[0.05]" />
        </div>
      </header>
      <main className="mx-auto max-w-7xl">
        <div className="mb-10 h-40 animate-pulse rounded-[2.5rem] border border-white/[0.06] bg-white/[0.04] backdrop-blur-md" />
        <DashboardGridSkeleton />
      </main>
    </div>
  );
}
