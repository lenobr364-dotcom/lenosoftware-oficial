import type { ReactNode } from "react";

type GlassChartShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  ariaLabel: string;
  accent?: "cyan" | "violet" | "gold" | "emerald";
  children: ReactNode;
  heightClass?: string;
};

const accentGlow: Record<NonNullable<GlassChartShellProps["accent"]>, string> = {
  cyan: "from-cyan-500/[0.06] border-cyan-400/20 shadow-[0_0_60px_rgba(34,211,238,0.08)]",
  violet: "from-violet-500/[0.06] border-violet-400/20 shadow-[0_0_60px_rgba(167,139,250,0.08)]",
  gold: "from-amber-500/[0.06] border-amber-400/20 shadow-[0_0_60px_rgba(251,191,36,0.08)]",
  emerald: "from-emerald-500/[0.06] border-emerald-400/20 shadow-[0_0_60px_rgba(52,211,153,0.08)]",
};

export function glassTooltipStyle() {
  return {
    background: "rgba(8,12,20,0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    boxShadow: "0 0 24px rgba(34,211,238,0.12)",
    backdropFilter: "blur(12px)",
  } as const;
}

export function GlassChartShell({
  eyebrow,
  title,
  subtitle,
  ariaLabel,
  accent = "cyan",
  children,
  heightClass = "h-[min(20rem,52vw)] md:h-72",
}: GlassChartShellProps) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br via-white/[0.04] to-transparent",
        "backdrop-blur-xl",
        accentGlow[accent],
      ].join(" ")}
      aria-label={ariaLabel}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_55%)]" />
      <div className="relative border-b border-white/[0.08] px-5 py-4 md:px-7 md:py-5">
        <p className="nx-type-eyebrow text-[0.58rem]">{eyebrow}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-white md:text-xl">{title}</h3>
        {subtitle ? <p className="mt-1 max-w-2xl text-xs text-white/45 md:text-sm">{subtitle}</p> : null}
      </div>
      <div className={`relative w-full px-1 pb-4 pt-1 md:px-3 ${heightClass}`}>{children}</div>
    </section>
  );
}
