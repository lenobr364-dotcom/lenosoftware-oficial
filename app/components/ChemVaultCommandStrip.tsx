import { readGcpLinkStatus } from "@/lib/gcp-link-status";
import { readGeminiLinkStatus } from "@/lib/gemini-health";
import { prisma } from "@/lib/prisma";
import { Cloud, FlaskConical, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

const shell = [
  "relative overflow-hidden rounded-[2rem] border border-white/[0.12]",
  "bg-[linear-gradient(165deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.04)_42%,rgba(2,3,8,0.55)_100%)]",
  "p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_48px_-22px_rgba(0,0,0,0.65)]",
  "backdrop-blur-[28px] backdrop-saturate-[1.35]",
].join(" ");

export async function ChemVaultCommandStrip() {
  const t = await getTranslations("Dashboard.commandDeck");
  const gcp = readGcpLinkStatus();
  const gemini = await readGeminiLinkStatus();

  let formulaCount = 0;
  let leadCount = 0;
  try {
    const [fc, lc] = await Promise.all([prisma.formula.count(), prisma.licenseRequest.count()]);
    formulaCount = fc;
    leadCount = lc;
  } catch {
    formulaCount = 0;
    leadCount = 0;
  }

  return (
    <section
      id="cv-tour-command-deck"
      className="scroll-mt-28 rounded-[2.5rem] border border-white/[0.1] bg-white/[0.03] p-7 shadow-[0_0_48px_rgba(34,211,238,0.06)] backdrop-blur-2xl md:p-9"
      aria-labelledby="command-deck-heading"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">{t("eyebrow")}</p>
      <h2 id="command-deck-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-500">{t("subtitle")}</p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <article className={shell}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-500/10 text-amber-100">
              <TrendingUp className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">{t("profitCardTitle")}</p>
          </div>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-white">{leadCount}</p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{t("profitCardBody")}</p>
        </article>

        <article className={shell}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-100">
              <FlaskConical className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">{t("formulasCardTitle")}</p>
          </div>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-white">{formulaCount}</p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">{t("formulasCardBody")}</p>
        </article>

        <article className={shell}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-100">
              <Cloud className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-neutral-400">{t("gcpCardTitle")}</p>
          </div>
          <p className={`mt-4 text-sm font-semibold ${gcp.status === "configured" ? "text-emerald-200" : "text-amber-200/90"}`}>
            {gcp.status === "configured" ? t("gcpConnected") : t("gcpDisconnected")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            {gcp.status === "configured" ? `${gcp.projectId}${gcp.region ? ` · ${gcp.region}` : ""}` : gcp.detail}
          </p>
          <p
            className={`mt-3 border-t border-white/[0.06] pt-3 text-xs font-medium leading-relaxed ${
              gemini.kind === "ok"
                ? "text-cyan-200/90"
                : gemini.kind === "unconfigured"
                  ? "text-neutral-500"
                  : "text-rose-300/90"
            }`}
          >
            {gemini.kind === "ok"
              ? t("geminiOk", { model: gemini.model, ms: gemini.latencyMs })
              : gemini.kind === "unconfigured"
                ? t("geminiUnconfigured")
                : t("geminiError", { message: gemini.detail })}
          </p>
        </article>
      </div>
    </section>
  );
}
