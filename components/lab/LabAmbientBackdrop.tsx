export function LabAmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="absolute -right-24 top-1/4 h-[440px] w-[440px] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-emerald-500/8 blur-3xl" />
    </div>
  );
}
