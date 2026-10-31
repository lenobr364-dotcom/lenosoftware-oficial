"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard, MetricValue, StatusBadge, buttonClass } from "@/components/glass";
import { EconomiaMonitor, getEconomiaMonitor, simularTransferencia } from "@/lib/api";

function num(value: string | number) {
  return Number(value);
}

function Grafico({ serie }: { serie: EconomiaMonitor["serie"] }) {
  const width = 640;
  const height = 180;
  const pad = 16;
  const points = serie.length > 0 ? serie : [{ indice: 0, lumen: 0, chemvault: 0, volume: 0 }];
  const max = Math.max(
    1,
    ...points.flatMap((p) => [num(p.lumen), num(p.chemvault)]),
  );

  function path(key: "lumen" | "chemvault") {
    return points
      .map((p, index) => {
        const x =
          pad +
          (points.length === 1 ? 0 : (index / (points.length - 1)) * (width - pad * 2));
        const y = height - pad - (num(p[key]) / max) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label="Saldos LNC">
      <path d={path("lumen")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <path d={path("chemvault")} fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
    </svg>
  );
}

export default function Economia() {
  const [monitor, setMonitor] = useState<EconomiaMonitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const next = await getEconomiaMonitor();
        if (!cancelled) {
          setMonitor(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao ler o livro-razão");
        }
      }
    }
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const lumen = useMemo(
    () => monitor?.carteiras.find((c) => c.codigo === "AG-LUMEN-ONEL"),
    [monitor],
  );
  const steward = useMemo(
    () => monitor?.carteiras.find((c) => c.codigo === "AG-CHEMVAULT"),
    [monitor],
  );

  async function onSimular() {
    setSending(true);
    setError(null);
    try {
      await simularTransferencia({
        origem_codigo: "AG-LUMEN-ONEL",
        destino_codigo: "AG-CHEMVAULT",
        montante: 25,
        custo_computacional: 0.25,
        descricao: "Simulação Lumen Onel → Steward ChemVault",
      });
      setMonitor(await getEconomiaMonitor());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transferência recusada");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <GlassCard className="md:col-span-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">Economia LNC</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Carteira digital</h2>
          </div>
          <StatusBadge live={Boolean(monitor)}>Livro-razão ativo</StatusBadge>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          Livro-razão da moeda interna e simulação de transferências entre AG-LUMEN-ONEL e o Steward
          ChemVault. Gráfico em tempo real (3 s).
        </p>
      </GlassCard>

      {error ? <p className="text-sm text-red-400 md:col-span-12">{error}</p> : null}

      <GlassCard className="md:col-span-7">
        <p className="text-xs text-zinc-500">Lumen Onel</p>
        <div className="mt-4">
          <MetricValue tone="green">{lumen?.saldo ?? "—"}</MetricValue>
        </div>
        <p className="mt-2 font-mono text-xs tracking-[0.18em] text-emerald-200/70">LNC</p>
      </GlassCard>
      <GlassCard className="md:col-span-5">
        <p className="text-xs text-zinc-500">Steward ChemVault</p>
        <div className="mt-4">
          <MetricValue>{steward?.saldo ?? "—"}</MetricValue>
        </div>
        <p className="mt-2 font-mono text-xs tracking-[0.18em] text-amber-200/70">LNC</p>
      </GlassCard>
      <GlassCard className="md:col-span-3">
        <p className="text-xs text-zinc-500">Volume liquidado</p>
        <div className="mt-4">
          <MetricValue tone="plain">{monitor?.volume_total ?? "—"}</MetricValue>
        </div>
      </GlassCard>
      <GlassCard className="md:col-span-3">
        <p className="text-xs text-zinc-500">Custo computacional</p>
        <div className="mt-4">
          <MetricValue tone="plain">{monitor?.custo_computacional_total ?? "—"}</MetricValue>
        </div>
      </GlassCard>
      <GlassCard className="md:col-span-6">
        <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
          <span>Saldos no tempo</span>
          <span className="font-mono">
            <span className="text-emerald-300">● Lumen</span> ● ChemVault
          </span>
        </div>
        <Grafico serie={monitor?.serie ?? []} />
      </GlassCard>

      <div className="md:col-span-12">
        <button
          type="button"
          disabled={sending}
          onClick={() => void onSimular()}
          className={buttonClass}
        >
          {sending ? "A liquidar…" : "Simular transferência Lumen → ChemVault"}
        </button>
      </div>

      <GlassCard className="md:col-span-12">
        <h3 className="text-sm font-medium text-zinc-500">Livro-razão</h3>
        {(monitor?.lancamentos ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Sem lançamentos. Execute uma simulação.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {monitor?.lancamentos.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap justify-between gap-2 rounded-xl border border-white/10 px-4 py-3"
              >
                <span>
                  {item.origem_codigo} → {item.destino_codigo}
                </span>
                <span className="font-mono">
                  {item.montante} {item.moeda} · taxa {item.custo_computacional}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
