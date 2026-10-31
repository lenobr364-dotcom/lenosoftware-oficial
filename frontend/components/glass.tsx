import type { ReactNode } from "react";

export const fieldClass =
  "w-full rounded-xl border border-amber-500/30 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none backdrop-blur-md transition placeholder:text-zinc-500 focus:border-amber-300 focus:shadow-[0_0_18px_rgba(251,191,36,0.4)]";

export const buttonClass =
  "rounded-xl border border-amber-500/30 bg-zinc-950/80 px-4 py-2.5 text-sm font-semibold text-amber-50 shadow-[0_0_16px_rgba(217,119,6,0.16)] transition duration-300 hover:border-amber-300/80 hover:shadow-[0_0_22px_rgba(251,191,36,0.38)] disabled:opacity-50";

export const buttonGhostClass =
  "rounded-xl border border-amber-500/30 bg-black/40 px-4 py-2 text-sm text-amber-50 backdrop-blur-md transition duration-300 hover:border-amber-300/80 hover:shadow-[0_0_18px_rgba(251,191,36,0.32)]";

export function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-200/40 via-white/10 to-emerald-300/15 p-px shadow-[0_18px_50px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_64px_rgba(212,175,55,0.22)] ${className}`}
    >
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-black/80 p-6 backdrop-blur-xl">
        {children}
      </div>
    </article>
  );
}

export function StatusBadge({
  live = false,
  children,
}: {
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-emerald-200 uppercase">
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 lumen-pulse" : "bg-zinc-500"}`}
      />
      {children}
    </span>
  );
}

export function MetricValue({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "green" | "plain";
}) {
  const color =
    tone === "green" ? "text-emerald-300" : tone === "gold" ? "text-amber-200" : "text-zinc-100";
  return (
    <p className={`font-mono text-4xl tracking-tight tabular-nums ${color}`}>{children}</p>
  );
}
