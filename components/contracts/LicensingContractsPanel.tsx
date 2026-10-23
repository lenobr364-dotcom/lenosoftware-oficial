"use client";

import { GlassContractsTable } from "@/components/contracts/GlassContractsTable";
import { SignatureFlowVisualizer } from "@/components/contracts/SignatureFlowVisualizer";
import { GlassButton, GlassMetric, GlassPanel } from "@/components/lab/design-system";
import type {
  ContractTermsPayload,
  LicensingContractRow,
  LicensingContractsPayload,
} from "@/lib/contracts/types";
import { FileDown, RefreshCw, Scale, Send, PenLine, Link2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

async function fetchContracts(locale: string): Promise<LicensingContractsPayload> {
  const res = await fetch(`/api/dashboard/licensing/contracts?locale=${encodeURIComponent(locale)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("fetch_failed");
  const json = (await res.json()) as { ok: boolean; data: LicensingContractsPayload };
  if (!json.ok) throw new Error("invalid_payload");
  return json.data;
}

export function LicensingContractsPanel() {
  const t = useTranslations("LicensingContracts");
  const locale = useLocale();
  const [data, setData] = useState<LicensingContractsPayload | null>(null);
  const [selected, setSelected] = useState<LicensingContractRow | null>(null);
  const [terms, setTerms] = useState<ContractTermsPayload | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchContracts(locale);
      setData(payload);
      setSelected((prev) => {
        if (!prev) return payload.contracts[0] ?? null;
        return payload.contracts.find((c) => c.id === prev.id && c.kind === prev.kind) ?? payload.contracts[0] ?? null;
      });
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "active") return data.contracts.filter((c) => c.displayStatus === "active");
    if (filter === "pending") return data.contracts.filter((c) => c.displayStatus === "pending");
    return data.contracts;
  }, [data, filter]);

  async function generateTerms() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        contractId: selected.id,
        kind: selected.kind,
        locale,
      });
      const res = await fetch(`/api/dashboard/licensing/contracts/terms?${params}`, {
        credentials: "include",
      });
      const json = (await res.json()) as {
        ok: boolean;
        terms: ContractTermsPayload;
        signature: LicensingContractRow["signature"];
      };
      if (!res.ok) throw new Error("terms_failed");
      setTerms(json.terms);
      setSelected((s) => (s ? { ...s, signature: json.signature } : s));
      await load();
    } catch {
      setError(t("termsError"));
    } finally {
      setBusy(false);
    }
  }

  async function signatureAction(
    action: "send_for_signature" | "mark_signed" | "anchor_chain",
    signerEmail?: string,
  ) {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/licensing/contracts/signature", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: selected.id,
          kind: selected.kind,
          action,
          signerEmail,
          hasChainAnchor: Boolean(selected.chainAnchor),
        }),
      });
      const json = (await res.json()) as { ok: boolean; signature: LicensingContractRow["signature"] };
      if (!res.ok) throw new Error("signature_failed");
      setSelected((s) => (s ? { ...s, signature: json.signature } : s));
      await load();
    } catch {
      setError(t("signatureError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nx-type-eyebrow text-[0.6rem] text-violet-300/80">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("title")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="nx-glass-nav-link inline-flex items-center gap-2 self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          {t("refresh")}
        </button>
      </header>

      {error ? (
        <GlassPanel padding="md" className="border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-200/90">{error}</p>
        </GlassPanel>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3" aria-label={t("countsAria")}>
        <GlassMetric
          label={t("countActive")}
          value={loading ? "…" : String(data?.counts.active ?? 0)}
          hint={t("countActiveHint")}
          icon={<Scale className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("countPending")}
          value={loading ? "…" : String(data?.counts.pending ?? 0)}
          hint={t("countPendingHint")}
          icon={<Send className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("countTotal")}
          value={loading ? "…" : String(data?.counts.total ?? 0)}
          hint={t("countTotalHint")}
          icon={<FileDown className="h-4 w-4" />}
        />
      </section>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "pending"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              "rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-md transition",
              filter === f
                ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-100"
                : "border-white/10 bg-white/[0.04] text-white/45 hover:text-white/70",
            ].join(" ")}
          >
            {t(`filter_${f}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,380px]">
        <GlassContractsTable
          rows={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(row) => {
            setSelected(row);
            setTerms(null);
          }}
        />

        <aside className="space-y-4">
          {selected ? (
            <>
              <GlassPanel padding="md" variant="elevated" className="nx-glass-panel--floating">
                <p className="nx-type-eyebrow text-[0.58rem]">{t("detailTitle")}</p>
                <p className="mt-2 font-semibold text-white">{selected.clientLabel}</p>
                <p className="nx-type-mono mt-1 text-xs text-white/45">{selected.formulaOrCompany}</p>
                {selected.grantHash ? (
                  <p className="nx-type-mono mt-3 break-all text-[0.65rem] text-cyan-200/60">
                    {selected.grantHash.slice(0, 24)}…
                  </p>
                ) : null}
              </GlassPanel>

              <SignatureFlowVisualizer contract={selected} />

              <GlassPanel padding="md" variant="subtle" className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">{t("actionsTitle")}</p>
                <GlassButton
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => void generateTerms()}
                  disabled={busy}
                >
                  <FileDown className="mr-2 h-4 w-4" aria-hidden />
                  {t("actionGenerateTerms")}
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  className="w-full justify-center backdrop-blur-xl"
                  onClick={() => void signatureAction("send_for_signature")}
                  disabled={busy}
                >
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  {t("actionSendSignature")}
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  className="w-full justify-center backdrop-blur-xl"
                  onClick={() => void signatureAction("mark_signed", selected.subjectCode)}
                  disabled={busy}
                >
                  <PenLine className="mr-2 h-4 w-4" aria-hidden />
                  {t("actionMarkSigned")}
                </GlassButton>
                {selected.kind === "industrial_grant" ? (
                  <GlassButton
                    variant="ghost"
                    className="w-full justify-center backdrop-blur-xl"
                    onClick={() => void signatureAction("anchor_chain")}
                    disabled={busy || !selected.grantHash}
                  >
                    <Link2 className="mr-2 h-4 w-4" aria-hidden />
                    {t("actionAnchorChain")}
                  </GlassButton>
                ) : null}
              </GlassPanel>

              {terms ? (
                <GlassPanel padding="md" variant="subtle" className="max-h-80 overflow-y-auto">
                  <p className="text-sm font-semibold text-white/90">{terms.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{terms.ipLine}</p>
                  <ul className="mt-4 space-y-3">
                    {terms.sections.map((s) => (
                      <li key={s.heading}>
                        <p className="text-xs font-semibold text-cyan-200/80">{s.heading}</p>
                        <p className="mt-1 text-xs leading-relaxed text-white/45">{s.body}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="nx-type-mono mt-4 text-[0.6rem] text-white/30">
                    {t("termsVersion", { version: terms.version })}
                  </p>
                </GlassPanel>
              ) : null}
            </>
          ) : (
            <GlassPanel padding="lg" className="text-center text-sm text-white/40">
              {t("selectContract")}
            </GlassPanel>
          )}
        </aside>
      </div>
    </div>
  );
}
