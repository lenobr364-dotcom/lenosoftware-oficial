import { getTranslations } from "next-intl/server";

import { BijuLandingAmbient } from "@/app/components/BijuLandingAmbient";
import { Link } from "@/i18n/navigation";

const glassPanel = [
  "relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-white/[0.1]",
  "bg-[linear-gradient(165deg,rgba(14,14,18,0.72)_0%,rgba(8,8,12,0.78)_50%,rgba(12,12,16,0.82)_100%)]",
  "px-8 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_64px_-28px_rgba(0,0,0,0.65)]",
  "backdrop-blur-[28px] backdrop-saturate-[1.25]",
  "sm:px-10 sm:py-14",
].join(" ");

const safeHarborBtn = [
  "relative inline-flex min-h-[3rem] w-full items-center justify-center overflow-hidden rounded-2xl",
  "px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-black",
  "bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300",
  "shadow-[0_0_28px_-6px_rgba(34,211,238,0.4)]",
  "transition duration-300 ease-out",
  "before:pointer-events-none before:absolute before:inset-0 before:translate-x-[-120%] before:skew-x-[-18deg] before:bg-gradient-to-r before:from-transparent before:via-white/45 before:to-transparent before:opacity-0 before:transition before:duration-500",
  "hover:before:translate-x-[120%] hover:before:opacity-100",
  "hover:shadow-[0_0_44px_-4px_rgba(34,211,238,0.55),0_0_72px_-12px_rgba(167,139,250,0.2)]",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020308]",
].join(" ");

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020308] px-5 py-16 text-white sm:px-8 md:px-12 md:py-20">
      <BijuLandingAmbient />

      <div className="relative z-10 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-cyan-200/70">{t("eyebrow")}</p>
        <h1
          className={[
            "mx-auto mt-6 max-w-xl text-center text-pretty text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
            "bg-gradient-to-br from-white via-neutral-100 to-cyan-200/90 bg-clip-text text-transparent",
            "[filter:drop-shadow(0_0_36px_rgba(34,211,238,0.12))]",
          ].join(" ")}
        >
          {t("title")}
        </h1>

        <div className={`${glassPanel} mt-10 text-center`}>
          <p className="text-pretty text-sm leading-relaxed text-neutral-400 sm:text-base">{t("description")}</p>
          <div className="mt-10">
            <Link href="/" className={safeHarborBtn}>
              {t("backButton")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
