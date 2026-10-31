"use client";

import { FormEvent, useEffect, useState } from "react";
import { buttonClass, buttonGhostClass, fieldClass } from "@/components/glass";
import {
  EquipamentoFrota,
  MonitorFrota,
  atualizarHorimetro,
  getMonitorFrota,
  abrirOrdemServico,
} from "@/lib/api";

function estadoClass(estado: string) {
  if (estado === "operacional") return "text-emerald-600";
  if (estado === "alerta") return "text-amber-500";
  return "text-red-600";
}

export default function Manutencao() {
  const [monitor, setMonitor] = useState<MonitorFrota | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setMonitor(await getMonitorFrota());
  }

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const next = await getMonitorFrota();
        if (!cancelled) {
          setMonitor(next);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao ler a frota");
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
  }, []);

  async function onHoras(event: FormEvent<HTMLFormElement>, equip: EquipamentoFrota) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await atualizarHorimetro(equip.id, Number(data.get("horas") || 1), Number(data.get("ciclos") || 1));
      event.currentTarget.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o horímetro");
    }
  }

  async function onOrdem(event: FormEvent<HTMLFormElement>, equip: EquipamentoFrota) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await abrirOrdemServico({
        equipamento_id: equip.id,
        tipo: "corretiva",
        descricao: String(data.get("descricao") ?? ""),
      });
      event.currentTarget.reset();
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir a OS");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm tracking-[0.2em] text-zinc-500 uppercase">Manutenção de frotas</p>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard de maquinaria pesada</h2>
        <p className="text-zinc-400">
          Horímetros, ciclos e alertas dos agentes mecânicos. Preventivas abrem automaticamente
          abaixo de 50 h de folga.
        </p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Operacionais</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{monitor?.operacionais ?? "—"}</p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Alertas</p>
          <p className="mt-1 text-2xl font-semibold text-amber-500">{monitor?.em_alerta ?? "—"}</p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">Em manutenção</p>
          <p className="mt-1 text-2xl font-semibold">{monitor?.em_manutencao ?? "—"}</p>
        </article>
        <article className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="text-xs text-zinc-500">OS abertas</p>
          <p className="mt-1 text-2xl font-semibold">{monitor?.ordens_abertas ?? "—"}</p>
        </article>
      </section>

      <section className="flex flex-col gap-3">
        {(monitor?.equipamentos ?? []).map((equip) => (
          <article
            key={equip.id}
            className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">
                {equip.codigo} · {equip.designacao}
              </h3>
              <span className={`text-xs uppercase ${estadoClass(equip.estado)}`}>{equip.estado}</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {equip.tipo} · agente {equip.agente_mecanico}
            </p>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Horímetro</dt>
                <dd>{equip.horimetro} h</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Ciclos</dt>
                <dd>{equip.ciclos}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Folga até preventiva</dt>
                <dd>{equip.horas_ate_preventiva} h</dd>
              </div>
            </dl>
            <form noValidate onSubmit={(event) => onHoras(event, equip)} className="mt-4 grid gap-2 sm:grid-cols-3">
              <input className={fieldClass} name="horas" type="number" min="0.1" step="0.1" defaultValue="8" />
              <input className={fieldClass} name="ciclos" type="number" min="0" step="1" defaultValue="12" />
              <button type="submit" className={buttonClass}>
                Lançar turno
              </button>
            </form>
            <form noValidate onSubmit={(event) => onOrdem(event, equip)} className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input className={fieldClass} name="descricao" placeholder="OS corretiva (sintoma)" required />
              <button
                type="submit"
                className={buttonGhostClass}
              >
                Abrir OS
              </button>
            </form>
            {equip.ordens.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                {equip.ordens.map((ordem) => (
                  <li key={ordem.id}>
                    {ordem.tipo} · {ordem.estado} · {ordem.descricao}
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
