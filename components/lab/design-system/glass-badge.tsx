import type { ReactNode } from "react";

export type GlassBadgeTone = "neutral" | "cyan" | "violet" | "emerald" | "gold" | "mono";

const toneClass: Record<GlassBadgeTone, string> = {
  neutral: "border-white/12 bg-white/[0.05] text-white/70",
  cyan: "border-cyan-400/25 bg-cyan-500/10 text-cyan-100/90",
  violet: "border-violet-400/20 bg-violet-500/10 text-violet-100/90",
  emerald: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200/90",
  gold: "border-amber-400/25 bg-amber-500/10 text-amber-100/90",
  mono: "border-white/10 bg-black/20 text-white/55 normal-case tracking-normal font-mono text-[0.65rem]",
};

export type GlassBadgeProps = {
  children: ReactNode;
  tone?: GlassBadgeTone;
  pulse?: boolean;
  className?: string;
};

export function GlassBadge({ children, tone = "neutral", pulse = false, className = "" }: GlassBadgeProps) {
  return (
    <span
      className={[
        "nx-glass-badge",
        toneClass[tone],
        pulse ? "nx-status-pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
