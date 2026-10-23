import type { ButtonHTMLAttributes, ReactNode } from "react";

type GlassButtonVariant = "primary" | "ghost" | "outline";

const variantClass: Record<GlassButtonVariant, string> = {
  primary:
    "border-cyan-400/35 bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-cyan-50 shadow-[var(--nx-glass-shadow-soft)] hover:border-cyan-300/50 hover:from-cyan-500/30 hover:shadow-[var(--nx-glass-shadow-glow)]",
  ghost:
    "border-transparent bg-white/[0.04] text-white/80 backdrop-blur-xl hover:bg-white/[0.08] hover:text-white",
  outline:
    "border-white/15 bg-white/[0.02] text-white/85 backdrop-blur-xl hover:border-white/25 hover:bg-white/[0.06]",
};

export type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: GlassButtonVariant;
};

export function GlassButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: GlassButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
        "disabled:pointer-events-none disabled:opacity-45",
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
