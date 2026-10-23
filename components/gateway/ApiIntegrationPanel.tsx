"use client";

import { FrostCodeBlock } from "@/components/gateway/FrostCodeBlock";
import { GlassAccessLogsTable } from "@/components/gateway/GlassAccessLogsTable";
import { GlassApiKeysTable } from "@/components/gateway/GlassApiKeysTable";
import { OpenApiExplorer } from "@/components/gateway/OpenApiExplorer";
import { GlassButton, GlassMetric, GlassPanel } from "@/components/lab/design-system";
import type { ApiKeyPublicRow, GatewayDashboardPayload } from "@/lib/gateway/types";
import { Activity, BookOpen, KeyRound, Plus, RefreshCw, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

async function fetchDashboard(): Promise<GatewayDashboardPayload> {
  const res = await fetch("/api/dashboard/gateway", { credentials: "include" });
  if (!res.ok) throw new Error("fetch_failed");
  const json = (await res.json()) as { ok: boolean; data: GatewayDashboardPayload };
  if (!json.ok) throw new Error("invalid");
  return json.data;
}

export function ApiIntegrationPanel() {
  const t = useTranslations("ApiIntegration");
  const [tab, setTab] = useState<"docs" | "keys">("docs");
  const [data, setData] = useState<GatewayDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyKeyId, setBusyKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [mintedSecret, setMintedSecret] = useState<string | null>(null);
  const [docFilter, setDocFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchDashboard();
      setData(payload);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function mintKey() {
    const label = newLabel.trim();
    if (!label) return;
    setBusy(true);
    setError(null);
    setMintedSecret(null);
    try {
      const res = await fetch("/api/dashboard/gateway/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const json = (await res.json()) as { ok: boolean; secret?: string; error?: string };
      if (!res.ok) {
        if (json.error === "active_key_limit") setError(t("keyLimitError"));
        else setError(t("mintError"));
        return;
      }
      setMintedSecret(json.secret ?? null);
      setNewLabel("");
      await load();
    } catch {
      setError(t("mintError"));
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(row: ApiKeyPublicRow) {
    setBusyKeyId(row.id);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/gateway/keys/revoke", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: row.id }),
      });
      if (!res.ok) throw new Error("revoke");
      await load();
    } catch {
      setError(t("revokeError"));
    } finally {
      setBusyKeyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nx-type-eyebrow text-[0.6rem] text-cyan-300/80">{t("eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">{t("title")}</h2>
          <p className="mt-2 max-w-3xl text-sm text-white/50">{t("subtitle")}</p>
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
          <span className="sr-only">error</span>
        </GlassPanel>
      ) : null}

      {mintedSecret ? (
        <GlassPanel padding="md" className="border-emerald-400/25 bg-emerald-500/10">
          <p className="text-sm font-medium text-emerald-100/95">{t("secretOnceTitle")}</p>
          <p className="mt-1 text-xs text-emerald-100/60">{t("secretOnceHint")}</p>
          <div className="mt-4">
            <FrostCodeBlock code={mintedSecret} label={t("secretLabel")} />
          </div>
        </GlassPanel>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("statsAria")}>
        <GlassMetric
          label={t("statActiveKeys")}
          value={loading ? "…" : String(data?.stats.activeKeys ?? 0)}
          hint={t("statActiveKeysHint")}
          icon={<KeyRound className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("statRevoked")}
          value={loading ? "…" : String(data?.stats.revokedKeys ?? 0)}
          hint={t("statRevokedHint")}
          icon={<Activity className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("statRequests24h")}
          value={loading ? "…" : String(data?.stats.requests24h ?? 0)}
          hint={t("statRequests24hHint")}
          icon={<Activity className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("statLatency")}
          value={loading ? "…" : `${data?.stats.avgLatencyMs ?? 0} ms`}
          hint={t("statLatencyHint")}
          icon={<BookOpen className="h-4 w-4" />}
        />
      </section>

      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl"
        role="tablist"
        aria-label={t("tabsAria")}
      >
        {(["docs", "keys"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={[
              "rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
              tab === id
                ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                : "text-white/45 hover:text-white/75",
            ].join(" ")}
          >
            {id === "docs" ? t("tabDocs") : t("tabKeys")}
          </button>
        ))}
      </div>

      {tab === "docs" ? (
        <section className="space-y-4">
          <GlassPanel padding="md">
            <p className="text-sm text-white/55">{t("docsIntro")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[12rem] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  value={docFilter}
                  onChange={(e) => setDocFilter(e.target.value)}
                  placeholder={t("docsSearchPlaceholder")}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.05] py-2.5 pl-10 pr-3 text-sm text-white backdrop-blur-xl placeholder:text-white/30 focus:border-cyan-400/35 focus:outline-none"
                />
              </div>
              <a
                href="/api/openapi.json"
                target="_blank"
                rel="noopener noreferrer"
                className="nx-glass-nav-link text-xs"
              >
                {t("downloadOpenApi")}
              </a>
            </div>
          </GlassPanel>
          <OpenApiExplorer filter={docFilter} />
        </section>
      ) : (
        <section className="space-y-6">
          <GlassPanel padding="md">
            <p className="text-sm font-semibold text-white/85">{t("mintTitle")}</p>
            <p className="mt-1 text-xs text-white/45">{t("mintHint")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={t("mintLabelPlaceholder")}
                className="min-w-[14rem] flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 text-sm text-white backdrop-blur-xl placeholder:text-white/30 focus:border-cyan-400/35 focus:outline-none"
              />
              <GlassButton
                type="button"
                disabled={busy || !newLabel.trim()}
                onClick={() => void mintKey()}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {busy ? t("minting") : t("mintKey")}
              </GlassButton>
            </div>
          </GlassPanel>

          <GlassApiKeysTable
            rows={data?.keys ?? []}
            busyId={busyKeyId}
            onRevoke={(row) => void revokeKey(row)}
          />

          <GlassAccessLogsTable rows={data?.logs ?? []} />
        </section>
      )}
    </div>
  );
}
