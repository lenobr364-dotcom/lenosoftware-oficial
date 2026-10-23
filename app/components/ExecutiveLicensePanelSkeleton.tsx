type ExecutiveLicensePanelSkeletonProps = {
  ariaLabel: string;
  hint: string;
};

export function ExecutiveLicensePanelSkeleton({ ariaLabel, hint }: ExecutiveLicensePanelSkeletonProps) {
  return (
    <section className="flex flex-col gap-8" aria-busy="true" aria-label={ariaLabel}>
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-white/10 sm:h-9 sm:w-80" />
        <div className="mt-1 h-4 w-full max-w-2xl animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.06]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <article
            key={i}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-[0_0_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-6"
          >
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-9 w-20 animate-pulse rounded-lg bg-amber-500/15 sm:h-10 sm:w-24" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.05]" />
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_0_48px_rgba(251,191,36,0.06)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <div className="h-6 w-64 animate-pulse rounded-md bg-white/10 sm:w-80" />
          <div className="mt-2 h-3.5 w-full max-w-lg animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="flex min-h-[220px] items-end gap-2 px-6 pb-8 pt-4">
          {[52, 84, 62, 96, 72, 46].map((px, i) => (
            <div key={i} className="flex flex-1 flex-col justify-end">
              <div
                className="mx-auto w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-amber-900/35 to-amber-500/22"
                style={{ height: px }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_0_60px_rgba(251,191,36,0.08)] backdrop-blur-2xl">
        <div className="border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
          <div className="h-6 w-48 animate-pulse rounded-md bg-white/10 sm:w-56" />
          <div className="mt-2 h-3.5 w-full max-w-md animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="overflow-x-auto px-5 py-6 sm:px-8">
          <div className="flex min-w-[860px] flex-col gap-3">
            <div className="flex gap-4 border-b border-white/10 pb-3">
              {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                <div key={k} className="h-3 flex-1 animate-pulse rounded-full bg-white/10" />
              ))}
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-4 py-2">
                <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-4 flex-[1.2] animate-pulse rounded bg-white/[0.07]" />
                <div className="h-4 w-20 shrink-0 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-4 flex-1 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-4 w-28 shrink-0 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-amber-500/10" />
                <div className="h-8 w-20 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
              </div>
            ))}
          </div>
        </div>
        <p className="border-t border-white/5 px-5 py-3 text-center text-[0.65rem] font-medium uppercase tracking-[0.28em] text-neutral-600 sm:px-8">
          {hint}
        </p>
      </div>
    </section>
  );
}
