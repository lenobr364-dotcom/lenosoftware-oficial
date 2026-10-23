import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import { GlassPanel } from "./glass-panel";

export type GlassModuleTileProps = {
  title: string;
  description: string;
  href: string;
  status: string;
  icon: LucideIcon;
};

export function GlassModuleTile({ title, description, href, status, icon: Icon }: GlassModuleTileProps) {
  return (
    <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded-[1.75rem]">
      <GlassPanel interactive padding="md" className="h-full">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight text-white/95">{title}</h3>
              <span className="nx-glass-badge shrink-0 border-emerald-400/25 bg-emerald-500/10 text-emerald-300/90">
                {status}
              </span>
            </div>
            <p className="nx-type-body mt-2 text-sm">{description}</p>
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}
