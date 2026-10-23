import type { HTMLAttributes, ReactNode } from "react";

type GlassVariant = "default" | "elevated" | "subtle";
type GlassPadding = "none" | "sm" | "md" | "lg";

const variantClass: Record<GlassVariant, string> = {
  default: "nx-glass-panel",
  elevated: "nx-glass-panel nx-glass-panel--elevated",
  subtle: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl",
};

const paddingClass: Record<GlassPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: GlassVariant;
  padding?: GlassPadding;
  interactive?: boolean;
};

export function GlassPanel({
  children,
  className = "",
  variant = "default",
  padding = "md",
  interactive = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={[
        variantClass[variant],
        paddingClass[padding],
        interactive ? "nx-glass-panel--interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
