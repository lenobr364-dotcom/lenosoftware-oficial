import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

export async function GlobalFooter() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "GlobalFooter" });

  return (
    <footer
      role="contentinfo"
      className="mt-auto shrink-0 border-t border-white/[0.06] bg-black/75 px-4 py-5 text-center backdrop-blur-md md:py-5 md:pb-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
    >
      <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-neutral-500">{t("division")}</p>
      <nav
        className="mx-auto mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px]"
        aria-label={t("navAria")}
      >
        <Link
          href="/about"
          className="text-neutral-500 underline-offset-[5px] transition hover:text-neutral-300 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {t("industrial")}
        </Link>
        <span className="text-neutral-700" aria-hidden>
          ·
        </span>
        <Link
          href="/pricing"
          className="text-neutral-500 underline-offset-[5px] transition hover:text-neutral-300 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {t("fieldIntel")}
        </Link>
      </nav>
    </footer>
  );
}
