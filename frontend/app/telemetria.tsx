"use client";

import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { GlassCard, MetricValue, StatusBadge, buttonClass, buttonGhostClass, fieldClass } from "@/components/glass";
import {
  TelemetriaMonitor,
  getTelemetriaMonitor,
  getToken,
  loginAdmin,
  logoutAdmin,
} from "@/lib/api";

function subscribeAuth(onChange: () => void) {
  window.addEventListener("leno-auth", onChange);
  return () => window.removeEventListener("leno-auth", onChange);
}

function authSnapshot() {
  return Boolean(getToken());
}

function notifyAuth() {
  window.dispatchEvent(new Event("leno-auth"));
}

function num(value: string | number) {
  return Number(value);
}

function Grafico({ serie }: { serie: TelemetriaMonitor["serie"] }) {
  const width = 640;
  const height = 160;
  const pad = 16;
  const points = serie.length > 0 ? serie : [];
  const max = Math.max(1, ...points.flatMap((p) => [num(p.cpu_percent), num(p.memoria_percent)]));

  function path(key: "cpu_percent" | "memoria_percent") {
    if (points.length === 0) {
      return "";
    }
    return points
      .map((p, index) => {
        const x =
          pad + (points.length === 1 ? 0 : (index / (points.length - 1)) * (width - pad * 2));
        const y = height - pad - (num(p[key]) / max) * (height - pad * 2);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="CPU e memória">
      <path d={path("cpu_percent")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <path d={path("memoria_percent")} fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
    </svg>
  );
}

export default function Telemetria() {
  const authed = useSyncExternalStore(subscribeAuth, authSnapshot, () => false);
  const [monitor, setMonitor] = useState<TelemetriaMonitor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) {
      return;
    }
    let cancelled = false;
    async function tick() {
      try {
        const next = await getTelemetriaMonitor();
        if (!cancelled) {
          setMonitor(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha na telemetria");
        }
      }
    }
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [authed]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await loginAdmin(String(data.get("username") ?? ""), String(data.get("password") ?? ""));
      notifyAuth();
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login recusado");
    }
  }

  if (!authed) {
    return (
      <GlassCard className="max-w-md">
        <p className="text-xs tracking-[0.22em] text-amber-200/70 uppercase">Telemetria e Auth</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Acesso administrativo</h2>
        <p className="mt-2 text-sm text-zinc-400">
          JWT obrigatório para telemetria, administração e transações LNC.
        </p>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        <form noValidate onSubmit={onLogin} className="mt-6 grid gap-3">
          <input className={fieldClass} name="username" placeholder="Utilizador" defaultValue="lumen" />
          <input className={fieldClass} name="password" type="password" placeholder="Palavra-passe" />
          <button type="submit" className={buttonClass}>
            Entrar
          </button>
        </form>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <GlassCard className="md:col-span-12">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.22em] text-zinc-500 uppercase">Telemetria global</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Desempenho e segurança</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge live={Boolean(monitor)}>Amostra viva</StatusBadge>
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                notifyAuth();
                setMonitor(null);
              }}
              className={buttonGhostClass}
            >
              Terminar sessão
            </button>
          </div>
        </div>
      </GlassCard>

      {error ? <p className="text-sm text-red-400 md:col-span-12">{error}</p> : null}

      <GlassCard className="md:col-span-6">
        <p className="text-xs text-zinc-500">CPU</p>
        <div className="mt-4">
          <MetricValue tone="green">{monitor?.cpu_atual ?? "—"}%</MetricValue>
        </div>
      </GlassCard>
      <GlassCard className="md:col-span-3">
        <p className="text-xs text-zinc-500">Memória</p>
        <div className="mt-4">
          <MetricValue tone="plain">{monitor?.memoria_atual ?? "—"}%</MetricValue>
        </div>
      </GlassCard>
      <GlassCard className="md:col-span-3">
        <p className="text-xs text-zinc-500">Latência amostra</p>
        <div className="mt-4">
          <MetricValue>{monitor?.latencia_atual ?? "—"}</MetricValue>
        </div>
        <p className="mt-2 font-mono text-xs text-amber-200/70">ms</p>
      </GlassCard>

      <GlassCard className="md:col-span-8">
        <div className="mb-3 flex justify-between text-xs text-zinc-500">
          <span>CPU / memória no tempo</span>
          <span className="font-mono">
            <span className="text-emerald-300">● CPU</span> ● RAM
          </span>
        </div>
        <Grafico serie={monitor?.serie ?? []} />
      </GlassCard>

      <GlassCard className="md:col-span-4">
        <h3 className="text-sm font-medium text-zinc-500">Nós</h3>
        <ul className="mt-3 grid gap-2">
          {(monitor?.nos ?? []).map((no) => (
            <li key={no.codigo} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {no.codigo} · {no.papel}
              </span>
              <StatusBadge live={no.estado === "online"}>{no.estado}</StatusBadge>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="md:col-span-12">
        <h3 className="text-sm font-medium text-zinc-500">Histórico de segurança</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {(monitor?.auditoria ?? []).map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap justify-between gap-2 rounded-xl border border-white/10 px-4 py-3"
            >
              <span>
                {item.ator} · {item.acao}
              </span>
              <span className="font-mono text-zinc-500">{item.recurso}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
