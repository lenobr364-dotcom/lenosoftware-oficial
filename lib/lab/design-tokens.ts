/**
 * Tokens do design system NEXUS Lab (espelham app/styles/nexus-glass.css).
 */

export const nxGlassTokens = {
  colors: {
    labBg: "#03050a",
    accentCyan: "#22d3ee",
    accentViolet: "#a78bfa",
    accentGold: "#d4af37",
    textPrimary: "rgba(255, 255, 255, 0.95)",
    textSecondary: "rgba(255, 255, 255, 0.55)",
    textMuted: "rgba(255, 255, 255, 0.38)",
  },
  blur: {
    default: "20px",
    heavy: "32px",
  },
  radius: {
    md: "1.25rem",
    lg: "1.75rem",
    xl: "2rem",
  },
  shadow: {
    panel: "0 8px 40px rgba(0, 0, 0, 0.45)",
    glow: "0 0 48px rgba(34, 211, 238, 0.12)",
    soft: "0 4px 24px rgba(0, 0, 0, 0.35)",
  },
} as const;

export type NxGlassElevation = "flat" | "raised" | "floating";
