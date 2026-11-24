"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassCard, MetricValue, StatusBadge } from "@/components/glass";
import LumenAssistant from "@/components/lumen-assistant";
import Economia from "./economia";
import Laboratorio from "./laboratorio";
import PainelLenoSoftware from "./painel-leno-software";
import Telemetria from "./telemetria";
import { API_URL, RootPayload, getRoot } from "@/lib/api";

type Tab = "console" | "laboratorio" | "fabrica" | "economia" | "telemetria";

const MODULES: { id: Tab; label: string }[] = [
  { id: "console", label: "Console" },
  { id: "laboratorio", label: "Laboratório ChemVault Global" },
  { id: "fabrica", label: "Fábrica de Agentes" },
  { id: "economia", label: "Economia LNC" },
  { id: "telemetria", label: "Telemetria e Auth" },
];

const MODULE_SPANS = ["md:col-span-4", "md:col-span-5", "md:col-span-3", "md:col-span-7", "md:col-span-5"];

function ConsoleBento({
  payload,
  error,
}: {
  payload: RootPayload | null;
  error: string | null;
}) {
  const modules = payload
    ? [
        ["Fábrica de Agentes", payload.modules.fabrica_de_agentes.status],
        ["ChemVault Global", payload.modules.chemvault_global.status],
        ["Economia LNC", payload.modules.economia?.status ?? "reserved"],
        ["Telemetria", payload.modules.telemetria?.status ?? "reserved"],
      ]
    : [];
  const cloudLive = payload?.status === "online";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <GlassCard className="md:col-span-7">
        <StatusBadge live={cloudLive}>{cloudLive ? "Cloud Run ligado" : "A sincronizar"}</StatusBadge>
        <h2 className="mt-4 bg-gradient-to-r from-amber-100 to-yellow-500 bg-clip-text text-3xl font-semibold text-transparent">
          Console do ecossistema
        </h2>
        <p className="mt-3 max-w-xl font-mono text-xs text-zinc-400">{API_URL}</p>
        {error ? (
          <p className="mt-6 text-sm text-red-400">Offline — {error}</p>
        ) : (
          <p className="mt-6 font-mono text-sm text-zinc-300">
            {payload ? `${payload.ecosystem} · ${payload.status}` : "A verificar a API…"}
          </p>
        )}
      </GlassCard>

      <GlassCard className="md:col-span-5">
        <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">Lumen</p>
        <div className="mt-6">
          <MetricValue>{payload?.lumen ?? "—"}</MetricValue>
        </div>
      </GlassCard>

      {modules.map(([label, status], index) => (
        <GlassCard key={label} className={MODULE_SPANS[index]}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <StatusBadge live={status === "online"}>{status}</StatusBadge>
          </div>
          <div className="mt-6">
            <MetricValue tone={status === "online" ? "green" : "plain"}>{status}</MetricValue>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("console");
  const [payload, setPayload] = useState<RootPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRoot()
      .then(setPayload)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Falha ao contactar a API");
      });
  }, []);

  const content =
    tab === "laboratorio" ? (
      <Laboratorio />
    ) : tab === "fabrica" ? (
      <PainelLenoSoftware />
    ) : tab === "economia" ? (
      <Economia />
    ) : tab === "telemetria" ? (
      <Telemetria />
    ) : (
      <ConsoleBento payload={payload} error={error} />
    );

  return (
    <div className="min-h-screen bg-black text-zinc-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,72,8,0.18),transparent_55%)]" />
      <header className="sticky top-0 z-40 border-b border-amber-200/15 bg-black/55 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-amber-200/80 uppercase">Leno.Software</p>
            <p className="text-sm text-zinc-400">Painel corporativo</p>
          </div>
          <nav className="flex min-w-0 flex-1 flex-wrap gap-2 lg:justify-end">
            {MODULES.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "border-amber-200 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-black shadow-[0_0_24px_rgba(251,191,36,0.62)]"
                      : "border-amber-500/30 bg-black/40 text-zinc-300 hover:border-amber-300/70 hover:text-amber-50 hover:shadow-[0_0_16px_rgba(251,191,36,0.28)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-6 py-8 pb-28">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="transform-gpu"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </main>
      <LumenAssistant />
    </div>
  );
}
