export default function LaboratorioLoading() {
  return (
    <div className="grid min-h-[calc(100vh-12rem)] animate-pulse grid-cols-1 gap-4 xl:grid-cols-[minmax(0,17rem)_1fr_minmax(0,18rem)]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl" />
      <div className="min-h-[32rem] rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl" />
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl" />
    </div>
  );
}
