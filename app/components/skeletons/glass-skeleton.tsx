import { glassPanel, glassPanelDense } from "@/lib/ui-glass";

const pulse = "animate-pulse";

/** Linha / bloco translúcido com blur — alinhado ao glass Leno.Software. */
export function GlassSkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.06] backdrop-blur-xl ${pulse} ${className}`}
      aria-hidden
    />
  );
}

export function ChemVaultCommandStripSkeleton() {
  return (
    <section
      className={`rounded-[2.5rem] p-7 md:p-9 ${glassPanel}`}
      aria-busy="true"
      aria-label="Loading command deck"
    >
      <GlassSkeletonLine className="h-3 w-40" />
      <GlassSkeletonLine className="mt-4 h-8 w-[72%] max-w-md" />
      <GlassSkeletonLine className="mt-3 h-4 w-full max-w-2xl" />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <article key={i} className={`p-6 ${glassPanelDense}`}>
            <div className="flex items-center gap-3">
              <GlassSkeletonLine className="h-11 w-11 shrink-0 rounded-xl" />
              <GlassSkeletonLine className="h-3 flex-1" />
            </div>
            <GlassSkeletonLine className="mt-5 h-8 w-20" />
            <GlassSkeletonLine className="mt-3 h-3 w-full" />
            <GlassSkeletonLine className="mt-2 h-3 w-4/5" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminMonitorSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10" aria-busy="true" aria-label="Loading admin monitor">
      <header className={`space-y-3 p-8 ${glassPanel}`}>
        <GlassSkeletonLine className="h-3 w-48" />
        <GlassSkeletonLine className="h-9 w-[68%] max-w-lg" />
        <GlassSkeletonLine className="h-4 w-full max-w-2xl" />
        <GlassSkeletonLine className="h-3 w-56" />
      </header>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`h-72 p-6 ${glassPanelDense}`}>
          <GlassSkeletonLine className="mb-6 h-4 w-40" />
          <GlassSkeletonLine className="h-48 w-full rounded-2xl" />
        </section>
        <section className={`h-72 p-6 ${glassPanelDense}`}>
          <GlassSkeletonLine className="mb-6 h-4 w-44" />
          <GlassSkeletonLine className="h-48 w-full rounded-2xl" />
        </section>
      </div>
      <section className={`h-56 p-6 ${glassPanelDense}`}>
        <GlassSkeletonLine className="mb-4 h-4 w-52" />
        <GlassSkeletonLine className="h-32 w-full rounded-2xl" />
      </section>
      <div className="grid gap-8 lg:grid-cols-2">
        <section className={`h-80 p-6 ${glassPanelDense}`}>
          <GlassSkeletonLine className="mb-4 h-4 w-36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassSkeletonLine key={i} className="mb-2 h-6 w-full" />
          ))}
        </section>
        <section className={`h-80 p-6 ${glassPanelDense}`}>
          <GlassSkeletonLine className="mb-4 h-4 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassSkeletonLine key={i} className="mb-2 h-6 w-full" />
          ))}
        </section>
      </div>
    </div>
  );
}

export function LandingFormulasGridSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" aria-busy="true" aria-label="Loading formulas">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`rounded-[2rem] p-6 ${glassPanelDense}`}>
          <GlassSkeletonLine className="h-3 w-24" />
          <GlassSkeletonLine className="mt-4 h-6 w-[80%]" />
          <GlassSkeletonLine className="mt-3 h-3 w-full" />
          <GlassSkeletonLine className="mt-2 h-3 w-[92%]" />
        </div>
      ))}
    </div>
  );
}

export function PortalAuthCardSkeleton() {
  return (
    <div className={`mx-auto mt-6 max-w-lg space-y-4 rounded-[2rem] p-6 ${glassPanelDense}`} aria-busy="true">
      <GlassSkeletonLine className="h-12 w-full rounded-2xl" />
      <GlassSkeletonLine className="h-12 w-full rounded-2xl" />
      <GlassSkeletonLine className="h-11 w-full rounded-2xl" />
    </div>
  );
}

/** Indicador glass durante validação do portão (latência de rede). */
export function GateValidatingSkeleton() {
  return (
    <div className={`mt-6 space-y-3 rounded-2xl p-4 ${glassPanelDense}`} aria-busy="true" aria-label="Validating">
      <GlassSkeletonLine className="h-3 w-full" />
      <GlassSkeletonLine className="h-3 w-[83%]" />
      <GlassSkeletonLine className="h-3 w-[66%]" />
    </div>
  );
}
