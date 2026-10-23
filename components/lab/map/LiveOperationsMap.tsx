"use client";

import {
  GlassBadge,
  GlassButton,
  GlassHeading,
  GlassPanel,
} from "@/components/lab/design-system";
import { OperationsMapCanvas } from "@/components/lab/map/OperationsMapCanvas";
import type { MapPointKind, OperationsMapPayload, OperationsMapPoint } from "@/lib/geo/types";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, RefreshCw, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ALL_KINDS: MapPointKind[] = ["hq", "license", "application", "imported", "activity", "request"];

async function fetchMap(locale: string, signal?: AbortSignal): Promise<OperationsMapPayload> {
  const res = await fetch(`/api/nexus/lab/geo/operations-map?locale=${encodeURIComponent(locale)}`, {
    credentials: "include",
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const json = (await res.json()) as { ok: boolean; data: OperationsMapPayload };
  if (!json.ok || !json.data) throw new Error("invalid_payload");
  return json.data;
}

export function LiveOperationsMap() {
  const t = useTranslations("LiveOpsMap");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<OperationsMapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<OperationsMapPoint | null>(null);
  const [uploading, setUploading] = useState(false);
  const [visibleKinds, setVisibleKinds] = useState<Set<MapPointKind>>(() => new Set(ALL_KINDS));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/nexus/lab/hq/attest", {
        method: "POST",
        credentials: "include",
      }).catch(() => undefined);
      const payload = await fetchMap(locale);
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleKind = (kind: MapPointKind) => {
    setVisibleKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/nexus/lab/geo/ingest", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("ingest_failed");
      await load();
    } catch {
      setError(t("uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const layerLegend = useMemo(
    () =>
      ALL_KINDS.map((kind) => ({
        kind,
        count: data?.layers[kind] ?? 0,
        label: t(`layer_${kind}`),
      })),
    [data?.layers, t],
  );

  return (
    <div className="mx-auto max-w-[100rem] px-5 py-6 sm:px-8 md:py-8">
      <GlassPanel variant="elevated" padding="lg" className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <GlassHeading
            level="display"
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
          />
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="ghost" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {t("refresh")}
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden />
              {uploading ? t("uploading") : t("uploadXml")}
            </GlassButton>
            <input
              ref={fileRef}
              type="file"
              accept=".xml,.gml,.kml,application/xml,text/xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onUpload(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </GlassPanel>

      {error ? (
        <GlassPanel padding="md" className="mb-4 border-rose-400/30 bg-rose-500/10">
          <p className="text-sm text-rose-200/90">{t("loadError")}</p>
        </GlassPanel>
      ) : null}

      <div className="relative min-h-[min(72vh,640px)] overflow-hidden rounded-3xl border border-white/10 shadow-[var(--nx-glass-shadow-soft)]">
        {data ? (
          <OperationsMapCanvas
            points={data.points}
            bounds={data.bounds}
            visibleKinds={visibleKinds}
            onHoverPoint={setHover}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#050a12]">
            <p className="nx-type-mono text-xs text-white/40">{loading ? t("loading") : "—"}</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-10">
          <GlassPanel
            padding="sm"
            className="pointer-events-auto absolute left-4 top-4 max-w-xs border-white/15 bg-black/35 backdrop-blur-xl"
          >
            <p className="nx-type-eyebrow mb-2 text-[0.58rem]">{t("legendTitle")}</p>
            <ul className="space-y-1.5">
              {layerLegend.map(({ kind, count, label }) => (
                <li key={kind}>
                  <button
                    type="button"
                    onClick={() => toggleKind(kind)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left text-xs transition ${
                      visibleKinds.has(kind)
                        ? "bg-white/10 text-white/90"
                        : "text-white/35 line-through"
                    }`}
                  >
                    <span>{label}</span>
                    <GlassBadge tone="mono">{count}</GlassBadge>
                  </button>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel
            padding="sm"
            className="pointer-events-none absolute right-4 top-4 min-w-[10rem] border-white/15 bg-black/35 backdrop-blur-xl"
          >
            <p className="nx-type-eyebrow text-[0.58rem]">{t("statsTitle")}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-200/95">
              {data?.points.length ?? 0}
            </p>
            <p className="text-xs text-white/50">{t("statsPoints")}</p>
          </GlassPanel>

          {hover ? (
            <GlassPanel
              padding="sm"
              className="pointer-events-none absolute bottom-20 left-1/2 max-w-md -translate-x-1/2 border-cyan-400/20 bg-black/50 backdrop-blur-xl md:bottom-6"
            >
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-white/95">{hover.label}</p>
                  <p className="text-xs text-white/55">{hover.regionLabel}</p>
                  <p className="nx-type-mono mt-1 text-[0.65rem] text-white/40">
                    {hover.lat.toFixed(4)}, {hover.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </GlassPanel>
          ) : null}
        </div>
      </div>

      {data?.ingestCatalog && data.ingestCatalog.length > 0 ? (
        <GlassPanel padding="md" className="mt-4" variant="subtle">
          <p className="nx-type-eyebrow mb-2 text-[0.58rem]">{t("ingestTitle")}</p>
          <ul className="space-y-1 text-xs text-white/60">
            {data.ingestCatalog.slice(0, 5).map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span className="truncate">{item.fileName}</span>
                <span className="nx-type-mono shrink-0 text-white/40">
                  {item.pointCount} · {new Date(item.ingestedAt).toLocaleString(locale)}
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}
    </div>
  );
}
