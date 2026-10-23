import type { ReactNode } from "react";

type GlassHeadingLevel = "display" | "title" | "section";

const levelClass: Record<GlassHeadingLevel, string> = {
  display: "nx-type-display",
  title: "nx-type-title",
  section: "text-lg font-semibold tracking-tight text-white/90",
};

export type GlassHeadingProps = {
  level?: GlassHeadingLevel;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function GlassHeading({
  level = "display",
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: GlassHeadingProps) {
  const titleClass = level === "display" ? "mt-2" : "mt-1";
  const textClass = levelClass[level];

  const titleNode = <span className={textClass}>{title}</span>;

  return (
    <header className={className}>
      {eyebrow ? <p className="nx-type-eyebrow">{eyebrow}</p> : null}
      {level === "display" ? (
        <h1 className={titleClass}>{titleNode}</h1>
      ) : level === "title" ? (
        <h2 className={titleClass}>{titleNode}</h2>
      ) : (
        <h3 className={titleClass}>{titleNode}</h3>
      )}
      {subtitle ? <p className="nx-type-body mt-3 max-w-2xl">{subtitle}</p> : null}
      {children}
    </header>
  );
}
