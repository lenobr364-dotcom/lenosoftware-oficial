export function DashboardQuickModulesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 animate-pulse" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-[7.5rem] rounded-2xl border border-white/8 bg-white/[0.04]" />
      ))}
    </div>
  );
}
