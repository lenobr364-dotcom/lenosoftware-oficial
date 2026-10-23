"use client";

import { ChemVaultPageBackdrop } from "@/app/components/ChemVaultPageBackdrop";
import { Link } from "@/i18n/navigation";
import { glassPanel, glassPanelDense } from "@/lib/ui-glass";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

export function SupportTicketForm() {
  const t = useTranslations("Dashboard.support");
  const td = useTranslations("Dashboard");
  const locale = useLocale();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          priority,
          requesterEmail: requesterEmail.trim(),
          requesterName: requesterName.trim() || null,
          uiLocale: locale,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setMessage(typeof data?.error === "string" ? data.error : t("errorGeneric"));
        return;
      }
      setStatus("done");
      setMessage(t("success"));
      setSubject("");
      setBody("");
    } catch {
      setStatus("error");
      setMessage(t("errorGeneric"));
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/[0.12] bg-black/45 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20";

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-6 py-10 text-white md:px-12">
      <ChemVaultPageBackdrop tone="dashboard" />
      <div className="relative z-10 mx-auto max-w-2xl space-y-8">
        <header className={`space-y-3 p-8 ${glassPanel}`}>
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-neutral-300 transition hover:border-cyan-400/30 hover:text-cyan-100"
          >
            ← {td("analyticsBack")}
          </Link>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-neutral-200/90">{t("lead")}</p>
        </header>

        <section className={`p-8 ${glassPanelDense}`}>
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-200">
              {t("labelEmail")}
              <input className={inputClass} type="email" value={requesterEmail} onChange={(ev) => setRequesterEmail(ev.target.value)} required />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-200">
              {t("labelName")}
              <input className={inputClass} type="text" value={requesterName} onChange={(ev) => setRequesterName(ev.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-200">
              {t("labelSubject")}
              <input className={inputClass} type="text" value={subject} onChange={(ev) => setSubject(ev.target.value)} required minLength={3} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-200">
              {t("labelPriority")}
              <select
                className={inputClass}
                value={priority}
                onChange={(ev) => setPriority(ev.target.value as "low" | "normal" | "high")}
              >
                <option value="low">{t("priorityLow")}</option>
                <option value="normal">{t("priorityNormal")}</option>
                <option value="high">{t("priorityHigh")}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-neutral-200">
              {t("labelBody")}
              <textarea
                className={`${inputClass} min-h-[140px] resize-y`}
                value={body}
                onChange={(ev) => setBody(ev.target.value)}
                required
                minLength={10}
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/15 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50 transition hover:bg-cyan-500/25 disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t("submitLoading")}
                </>
              ) : (
                t("submit")
              )}
            </button>
          </form>
          {message ? (
            <p className={`mt-4 text-sm leading-relaxed ${status === "error" ? "text-rose-300" : "text-emerald-200/90"}`} role="status">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
