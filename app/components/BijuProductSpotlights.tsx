import { getTranslations } from "next-intl/server";
import { Leaf, Sparkles, Sprout } from "lucide-react";

const spotlightShell = [
  "group relative isolate overflow-hidden rounded-[2rem] p-7 sm:p-8",
  "border border-white/[0.12]",
  "bg-[linear-gradient(155deg,rgba(255,255,255,0.11)_0%,rgba(255,255,255,0.04)_38%,rgba(2,6,12,0.55)_100%)]",
  "backdrop-blur-[32px] backdrop-saturate-[1.35]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.22),0_20px_56px_-22px_rgba(0,0,0,0.7)]",
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  "hover:-translate-y-1 hover:border-cyan-400/30",
  "hover:shadow-[inset_0_0_56px_rgba(34,211,238,0.08),0_28px_64px_-18px_rgba(0,0,0,0.65)]",
].join(" ");

const iconWrap = [
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.14]",
  "bg-gradient-to-br from-white/[0.12] to-black/40 backdrop-blur-xl",
  "text-amber-100/95 shadow-[0_0_28px_rgba(34,211,238,0.12)]",
].join(" ");

const cards = [
  { titleKey: "spotlightSolupanTitle" as const, bodyKey: "spotlightSolupanBody" as const, Icon: Sparkles },
  { titleKey: "spotlightArlaTitle" as const, bodyKey: "spotlightArlaBody" as const, Icon: Leaf },
  { titleKey: "spotlightNutrientsTitle" as const, bodyKey: "spotlightNutrientsBody" as const, Icon: Sprout },
];

export async function BijuProductSpotlights() {
  const t = await getTranslations("BijuLanding");

  return (
    <section className="relative mx-auto mt-20 max-w-6xl md:mt-24" aria-labelledby="spotlight-heading">
      <div className="text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/65">{t("spotlightEyebrow")}</p>
        <h2 id="spotlight-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {t("spotlightTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-neutral-500 md:text-base">{t("spotlightLead")}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-7">
        {cards.map(({ titleKey, bodyKey, Icon }) => (
          <article key={titleKey} className={spotlightShell}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_100%_90%_at_50%_-10%,rgba(34,211,238,0.14),transparent_58%)]"
            />
            <div className="relative z-10 flex flex-col gap-5">
              <div className={iconWrap}>
                <Icon className="h-7 w-7 stroke-[1.6]" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">{t(titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400/95">{t(bodyKey)}</p>
              </div>
              <p className="mt-auto rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-200/85 backdrop-blur-md">
                {t("spotlightEcoBocalHint")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
