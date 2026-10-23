export type VaultBackdropTone = "gate" | "dashboard" | "analytics";

export function ChemVaultPageBackdrop({ tone }: { tone: VaultBackdropTone }) {
  if (tone === "analytics") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_62%)] blur-3xl transition-[opacity,transform] duration-500 ease-out" />
        <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,90,0.13),transparent_60%)] blur-3xl transition-[opacity,transform] duration-500 ease-out" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0),rgba(0,0,0,0.78))]" />
      </div>
    );
  }

  if (tone === "dashboard") {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.20),transparent_60%)] blur-2xl transition-[opacity,transform] duration-500 ease-out" />
        <div className="absolute -left-28 top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.14),transparent_60%)] blur-2xl transition-[opacity,transform] duration-500 ease-out" />
        <div className="absolute -right-40 bottom-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.14),transparent_60%)] blur-2xl transition-[opacity,transform] duration-500 ease-out" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.72))]" />
      </div>
    );
  }

  /* gate — alinhado ao portal / home para transição suave com o painel */
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.16),transparent_62%)] blur-3xl transition-[opacity,transform] duration-500 ease-out" />
      <div className="absolute bottom-[-10%] left-[-5%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.09),transparent_58%)] blur-3xl transition-[opacity,transform] duration-500 ease-out" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.88))]" />
    </div>
  );
}
