/**
 * Shared glassmorphism surface tokens (backdrop blur, translucency, specular ring).
 * Keep heavy visual logic centralized so screens stay consistent under theme tweaks.
 */

export const glassPanel =
  "rounded-[2rem] border border-white/[0.14] bg-[linear-gradient(165deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_38%,rgba(3,5,12,0.55)_100%)] backdrop-blur-[28px] backdrop-saturate-[1.35] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_22px_64px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.05]";

export const glassPanelDense =
  "rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_48px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.04]";

export const glassButton =
  "rounded-xl border border-white/12 bg-white/[0.08] px-4 py-2.5 text-sm text-white/95 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.14] active:scale-[0.99]";

export const glassInput =
  "w-full rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 backdrop-blur-md outline-none ring-0 transition-[border,box-shadow] focus:border-amber-200/35 focus:shadow-[0_0_0_1px_rgba(251,191,36,0.2)]";

/** Invólucro para tabelas de dados (backdrop + vidro semitransparente). */
export const tableGlassWrap =
  "overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_22px_56px_-22px_rgba(0,0,0,0.58)] backdrop-blur-xl backdrop-saturate-[1.25] ring-1 ring-white/[0.06]";

export const tableGlassHeadRow =
  "bg-white/[0.08] backdrop-blur-xl border-b border-white/[0.1]";

export const tableGlassBodyRow =
  "border-b border-white/[0.07] transition-colors hover:bg-white/[0.06]";

/** Overlay de modal — desfoque forte no conteúdo por trás (legibilidade do painel). */
export const modalBackdropClass =
  "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl backdrop-saturate-150";

/** Painel de modal — vidro mais opaco + texto de alto contraste. */
export const modalPanelClass =
  "max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/14 bg-zinc-950/92 p-8 shadow-[0_0_80px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[40px] backdrop-saturate-[1.2] ring-1 ring-white/[0.08]";

export const modalTitleClass = "text-lg font-semibold tracking-tight text-white [text-shadow:0_1px_0_rgba(0,0,0,0.45)]";

export const modalBodyMutedClass = "text-sm leading-relaxed text-neutral-200/95";

export const modalHintClass = "mt-4 text-xs leading-relaxed text-neutral-300/90";
