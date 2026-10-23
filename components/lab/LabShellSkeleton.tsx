import { GlassPanel } from "@/components/lab/design-system";

export function LabShellSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-5 py-8 sm:px-8 md:py-10">
      <GlassPanel padding="lg" className="mb-10 h-40">
        <span className="sr-only">Loading</span>
      </GlassPanel>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <GlassPanel key={i} padding="sm" className="h-36">
            <span className="sr-only">Loading</span>
          </GlassPanel>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <GlassPanel key={i} padding="md" className="h-32">
            <span className="sr-only">Loading</span>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
