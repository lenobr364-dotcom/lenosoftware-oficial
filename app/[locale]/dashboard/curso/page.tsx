import { Link } from "@/i18n/navigation";
import { CHEMVAULT_COURSE_MODULES } from "@/lib/course-modules";
import { BookOpen, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

const panel = [
  "rounded-[2rem] border border-white/[0.1]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.06)_0%,rgba(8,8,12,0.78)_55%,rgba(4,4,8,0.92)_100%)]",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:p-8",
].join(" ");

export default async function CursoPage() {
  const t = await getTranslations("Dashboard");

  return (
    <div className="min-h-screen bg-black px-5 pb-28 pt-10 text-white md:px-10 md:pb-14 md:pt-14">
      <header className="mx-auto max-w-3xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-200/80">{t("courseEyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("courseTitle")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-500">{t("courseSubtitle")}</p>
      </header>

      <ol className="mx-auto mt-10 max-w-3xl list-none space-y-4">
        {CHEMVAULT_COURSE_MODULES.map((m, i) => (
          <li key={m.id}>
            <div className={panel}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-100">
                    <BookOpen className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      {t("courseEyebrow")} · {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">{t(m.titleKey)}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400">{t(m.summaryKey)}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                    m.status === "ready"
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200/95"
                      : "border-white/15 bg-white/[0.04] text-neutral-400"
                  }`}
                >
                  {m.status === "ready" ? t("courseStatusReady") : t("courseStatusDraft")}
                </span>
              </div>
              {m.status === "ready" ? (
                <div className="mt-5 border-t border-white/[0.06] pt-5">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300/90 transition hover:text-cyan-200"
                  >
                    {t("navVaultHome")}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
