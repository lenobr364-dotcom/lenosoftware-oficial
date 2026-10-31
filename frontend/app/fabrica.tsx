"use client";

import { FormEvent, useEffect, useState } from "react";
import { buttonClass, buttonGhostClass, fieldClass } from "@/components/glass";
import {
  AgenteAutonomo,
  MonitorFabrica,
  criarAgente,
  despacharAgente,
  getMonitorFabrica,
} from "@/lib/api";

function estadoClass(estado: string) {
  if (estado === "busy" || estado === "active") {
    return "text-emerald-600";
  }
  if (estado === "offline") {
    return "text-red-600";
  }
  return "text-zinc-500";
}

export default function Fabrica() {
  const [monitor, setMonitor] = useState<MonitorFabrica | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const next = await getMonitorFabrica();
    setMonitor(next);
  }

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const next = await getMonitorFabrica();
        if (!cancelled) {
          setMonitor(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao monitorizar a fábrica");
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

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await criarAgente({
        codigo: String(data.get("codigo") ?? ""),
        nome: String(data.get("nome") ?? ""),
        papel: String(data.get("papel") ?? ""),
        creditos: Number(data.get("creditos") || 100),
        custo_processamento: Number(data.get("custo_processamento") || 1.25),
      });
      form.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o agente");
    } finally {
      setSaving(false);
    }
  }

  async function onDispatch(event: FormEvent<HTMLFormElement>, agente: AgenteAutonomo) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await despacharAgente(agente.id, {
        titulo: String(data.get("titulo") ?? ""),
        descricao: String(data.get("descricao") ?? ""),
      });
      form.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível despachar a tarefa");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm tracking-[0.2em] text-zinc-500 uppercase">Fábrica de Agentes</p>
        <h2 className="text-2xl font-semibold tracking-tight">Painel de controlo</h2>
        <p className="text-zinc-400">
          Orquestração de agentes autónomos, despacho de tarefas e consumo de créditos em tempo
          real (atualização a cada 3 s).
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Agentes ativos</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {monitor ? `${monitor.agentes_ativos}/${monitor.agentes_totais}` : "—"}
          </p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Tarefas em curso</p>
          <p className="mt-1 text-2xl font-semibold">{monitor?.tarefas_em_curso ?? "—"}</p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Créditos em caixa</p>
          <p className="mt-1 text-2xl font-semibold">{monitor?.creditos_em_caixa ?? "—"}</p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Créditos consumidos</p>
          <p className="mt-1 text-2xl font-semibold">{monitor?.creditos_consumidos ?? "—"}</p>
        </article>
      </section>

      <form
        noValidate
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        <h3 className="text-sm font-medium text-zinc-500">Criar agente</h3>
        <input className={fieldClass} name="codigo" placeholder="Código (ex.: AG-NOVO-01)" required />
        <input className={fieldClass} name="nome" placeholder="Nome" required />
        <input className={fieldClass} name="papel" placeholder="Papel operacional" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            name="creditos"
            type="number"
            min="0"
            step="0.0001"
            defaultValue="100"
          />
          <input
            className={fieldClass}
            name="custo_processamento"
            type="number"
            min="0"
            step="0.0001"
            defaultValue="1.25"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className={buttonClass}
        >
          {saving ? "A gravar…" : "Registar agente"}
        </button>
      </form>

      <section className="flex flex-col gap-3">
        {(monitor?.agentes ?? []).map((agente) => (
          <article
            key={agente.id}
            className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-semibold">{agente.nome}</h4>
              <span className={`text-xs uppercase ${estadoClass(agente.estado)}`}>{agente.estado}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {agente.codigo} · {agente.papel}
            </p>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Créditos</dt>
                <dd>{agente.creditos}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Custo por despacho</dt>
                <dd>{agente.custo_processamento}</dd>
              </div>
            </dl>
            <form noValidate onSubmit={(event) => onDispatch(event, agente)} className="mt-4 grid gap-2">
              <input className={fieldClass} name="titulo" placeholder="Título da tarefa" required />
              <input className={fieldClass} name="descricao" placeholder="Descrição (opcional)" />
              <button
                type="submit"
                className={buttonGhostClass}
              >
                Despachar
              </button>
            </form>
            {agente.tarefas.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                {agente.tarefas
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((tarefa) => (
                    <li key={tarefa.id}>
                      {tarefa.estado} · {tarefa.titulo} · custo {tarefa.custo_processamento}
                    </li>
                  ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
