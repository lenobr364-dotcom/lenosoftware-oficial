"use client";

import { GlassFormulaVaultCard } from "@/components/vault/GlassFormulaVaultCard";
import { GlassMetric, GlassPanel } from "@/components/lab/design-system";
import type { VaultCatalogPayload, VaultDownloadBlockReason } from "@/lib/vault/types";
import { Lock, MapPin, RefreshCw, Shield } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export function ChemicalVaultPanel() {
  const t = useTranslations("ChemicalVault");
  const locale = useLocale();
  const [data, setData] = useState<VaultCatalogPayload | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [loading, setLoading] = useState(true);
  const [lastBlock, setLastBlock] = useState<VaultDownloadBlockReason | null>(null);

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120_000 },
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ locale });
      if (coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
      }
      const res = await fetch(`/api/dashboard/vault/catalog?${params}`, { credentials: "include" });
      const json = (await res.json()) as { ok: boolean; data: VaultCatalogPayload };
      if (json.ok) setData(json.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [coords, locale]);

  useEffect(() => {
    requestGeo();
  }, [requestGeo]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="nx-type-eyebrow text-[0.6rem] text-amber-300/80">{t("eyebrow")}</p>
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

      {lastBlock && lastBlock !== "none" ? (
        <GlassPanel padding="md" className="border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-100/90">{t(`alert_${lastBlock}` as Parameters<typeof t>[0])}</p>
        </GlassPanel>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3" aria-label={t("statsAria")}>
        <GlassMetric
          label={t("statTotal")}
          value={loading ? "…" : String(data?.stats.total ?? 0)}
          hint={t("statTotalHint")}
          icon={<Shield className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("statEncrypted")}
          value={loading ? "…" : String(data?.stats.encrypted ?? 0)}
          hint={t("statEncryptedHint")}
          icon={<Lock className="h-4 w-4" />}
        />
        <GlassMetric
          label={t("statReady")}
          value={loading ? "…" : String(data?.stats.downloadReady ?? 0)}
          hint={t("statReadyHint")}
          icon={<Lock className="h-4 w-4" />}
        />
      </section>

      <GlassPanel padding="md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs text-white/55">
            <MapPin className="h-3.5 w-3.5 text-amber-400/80" />
            {t("regionContext")}
          </p>
          <button
            type="button"
            onClick={requestGeo}
            className="text-[0.65rem] font-semibold uppercase tracking-wider text-amber-300/80 hover:text-amber-200"
          >
            {t("geoRefresh")}
          </button>
        </div>
        <p className="mt-2 text-sm text-white/70">
          {data
            ? t(data.regionLabelKey as Parameters<typeof t>[0])
            : geoStatus === "ok" && coords
              ? t("geoCoords", { lat: coords.lat.toFixed(4), lng: coords.lng.toFixed(4) })
              : t("geoUnavailable")}
        </p>
      </GlassPanel>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/8 bg-white/[0.04]" />
            ))
          : data?.items.map((item) => (
              <GlassFormulaVaultCard
                key={item.id}
                item={item}
                coords={coords}
                onBlocked={(reason) => setLastBlock(reason)}
              />
            ))}
      </div>
    </div>
  );
}
