"use client";

import { FrostCodeBlock } from "@/components/gateway/FrostCodeBlock";
import type { OpenApiPathMethod } from "@/lib/gateway/types";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

function methodColor(method: string): string {
  switch (method) {
    case "get":
      return "from-emerald-500/30 to-teal-500/10 text-emerald-200 border-emerald-400/25";
    case "post":
      return "from-violet-500/30 to-fuchsia-500/10 text-violet-200 border-violet-400/25";
    case "put":
    case "patch":
      return "from-amber-500/30 to-orange-500/10 text-amber-200 border-amber-400/25";
    case "delete":
      return "from-rose-500/30 to-red-500/10 text-rose-200 border-rose-400/25";
    default:
      return "from-white/20 to-white/5 text-white/70 border-white/15";
  }
}

function flattenPaths(spec: Record<string, unknown>): OpenApiPathMethod[] {
  const paths = spec.paths as Record<string, Record<string, unknown>> | undefined;
  if (!paths) return [];
  const out: OpenApiPathMethod[] = [];
  for (const [path, item] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (op && typeof op === "object") {
        out.push({ path, method: method.toUpperCase(), operation: op as Record<string, unknown> });
      }
    }
  }
  return out.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
}

type OpenApiExplorerProps = {
  filter?: string;
};

export function OpenApiExplorer({ filter = "" }: OpenApiExplorerProps) {
  const t = useTranslations("ApiIntegration");
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<OpenApiPathMethod | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/openapi.json", { credentials: "same-origin" });
        if (!res.ok) throw new Error("spec");
        const json = (await res.json()) as Record<string, unknown>;
        if (!cancelled) {
          setSpec(json);
          const flat = flattenPaths(json);
          setSelected(flat[0] ?? null);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const operations = useMemo(() => {
    if (!spec) return [];
    const q = filter.trim().toLowerCase();
    const all = flattenPaths(spec);
    if (!q) return all;
    return all.filter(
      (op) =>
        op.path.toLowerCase().includes(q) ||
        op.method.toLowerCase().includes(q) ||
        String(op.operation.summary ?? "").toLowerCase().includes(q),
    );
  }, [spec, filter]);

  const detailJson = useMemo(() => {
    if (!selected) return "{}";
    return JSON.stringify(selected.operation, null, 2);
  }, [selected]);

  const curlExample = useMemo(() => {
    if (!selected) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://your-app.example";
    return `curl -sS -X ${selected.method} \\
  "${origin}${selected.path}" \\
  -H "Authorization: Bearer cvk_live_<keyId>.<secret>" \\
  -H "Accept: application/json"`;
  }, [selected]);

  if (loading) {
    return <p className="text-sm text-white/45">{t("openapiLoading")}</p>;
  }
  if (error || !spec) {
    return <p className="text-sm text-rose-300/80">{t("openapiError")}</p>;
  }

  const info = spec.info as { title?: string; version?: string; description?: string } | undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold text-white/90">{info?.title ?? "OpenAPI"}</p>
          <p className="mt-0.5 text-xs text-white/45">
            {t("openapiVersion", { version: info?.version ?? "—" })}
          </p>
        </div>
        <ul className="max-h-[32rem] overflow-y-auto divide-y divide-white/[0.06]">
          {operations.map((op) => {
            const active = selected?.path === op.path && selected?.method === op.method;
            return (
              <li key={`${op.method}:${op.path}`}>
                <button
                  type="button"
                  onClick={() => setSelected(op)}
                  className={[
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                    active ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/5" : "hover:bg-white/[0.04]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "shrink-0 rounded-lg border bg-gradient-to-br px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider",
                      methodColor(op.method.toLowerCase()),
                    ].join(" ")}
                  >
                    {op.method}
                  </span>
                  <span className="min-w-0">
                    <span className="block nx-type-mono text-xs text-white/80">{op.path}</span>
                    <span className="mt-0.5 block text-xs text-white/40">
                      {String(op.operation.summary ?? "")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        {selected ? (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/40">
                {t("openapiSelected")}
              </p>
              <p className="mt-2 nx-type-mono text-sm text-cyan-100/90">
                <span
                  className={[
                    "mr-2 inline-block rounded-md border bg-gradient-to-br px-2 py-0.5 text-[0.65rem] font-bold",
                    methodColor(selected.method.toLowerCase()),
                  ].join(" ")}
                >
                  {selected.method}
                </span>
                {selected.path}
              </p>
              {selected.operation.description ? (
                <p className="mt-2 text-sm text-white/55">{String(selected.operation.description)}</p>
              ) : null}
            </div>
            <FrostCodeBlock code={detailJson} label={t("openapiSchemaLabel")} />
            <FrostCodeBlock code={curlExample} label={t("openapiCurlLabel")} />
          </>
        ) : (
          <p className="text-sm text-white/40">{t("openapiSelectHint")}</p>
        )}
      </div>
    </div>
  );
}
