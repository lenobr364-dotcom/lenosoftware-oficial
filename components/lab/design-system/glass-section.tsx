import type { ReactNode } from "react";

export type GlassSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function GlassSection({ id, title, subtitle, action, children, className = "" }: GlassSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id={headingId} className="nx-type-title">
            {title}
          </h2>
          {subtitle ? <p className="nx-type-body mt-1 text-sm">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
