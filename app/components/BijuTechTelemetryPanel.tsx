"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

const mono = "font-mono tabular-nums tracking-tight";
const neonBorder = "border border-[#00d4ff]/40 shadow-[0_0_28px_rgba(0,212,255,0.12)]";
const panel = `rounded-xl bg-[#080808]/90 px-5 py-5 backdrop-blur-md ${neonBorder}`;

/** Logs de comando — AI Brain (rotação automática) */
const AI_LOG_POOL = [
  "Verificação de criptografia",
  "Sensores Eco-Bocal calibrados",
  "Protocolo Starlink Ativo",
  "Nódio de decisão: heurística de carga estável",
  "Tensor de comando Lumen — inferência em 4.2 ms",
  "Política de limite químico Eco-Bocal conforme",
  "Beacon uplink: integridade de pacotes 100%",
  "Autoescala propulsão — setpoint dentro da banda",
  "Reconciliação sensores vs. modelo digital twin OK",
  "Sincronização de relógio GNSS/terrestre lock",
];

function useClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 500);
    return () => window.clearInterval(id);
  }, []);
  return tick;
}

/** Fase rápida para micro-oscilação dos números exibidos */
function useWavePhase() {
  const [wave, setWave] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setWave((w) => w + 0.14), 110);
    return () => window.clearInterval(id);
  }, []);
  return wave;
}

function PerformanceSparkline({ tick }: { tick: number }) {
  const gradId = useId().replace(/:/g, "");
  const w = 360;
  const h = 96;

  const path = useMemo(() => {
    const pts: string[] = [];
    const t = tick * 0.55;
    for (let i = 0; i <= 56; i++) {
      const x = (i / 56) * w;
      const pulse = Math.sin(i * 0.85 + t * 1.4) * 0.18;
      const carrier = Math.sin(i * 0.22 + t * 0.25) * 0.14;
      const micro = Math.sin(i * 3.2 + t) * 0.06;
      const y = h * 0.5 - (pulse + carrier + micro) * h * 0.42;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [tick]);

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00d4ff]/90">Monitor de Estabilidade</p>
          <p className={`mt-1 ${mono} text-[11px] font-semibold text-white/90`}>Estabilidade da IA no Comando</p>
        </div>
        <span className={`${mono} text-[9px] text-[#00d4ff]/55`}>pulso · neural · campo</span>
      </div>
      <p className="mt-2 text-[10px] text-gray-500">Linha de referência — desvio mínimo esperado sob controlo fechado</p>
      <div className="relative mt-4 h-[118px] w-full">
        <svg className="h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${gradId}`}>
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={`${path} L ${w} ${h} L 0 ${h} Z`}
            fill={`url(#spark-${gradId})`}
            className="transition-[d] duration-200 ease-linear"
          />
          <path
            d={path}
            fill="none"
            stroke="#00d4ff"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${gradId})`}
            className="drop-shadow-[0_0_10px_rgba(0,212,255,0.55)]"
          />
        </svg>
        <div className={`pointer-events-none absolute bottom-1 left-2 ${mono} text-[9px] text-emerald-400/90`} aria-live="polite">
          σ comando · regime estável
        </div>
      </div>
    </div>
  );
}

export function BijuTechTelemetryPanel() {
  const tick = useClock();
  const wave = useWavePhase();
  const [rpm, setRpm] = useState(1850);
  const [temp, setTemp] = useState(82);
  const [flow, setFlow] = useState(4.2);
  const [level, setLevel] = useState(88);
  const [latency, setLatency] = useState(32);
  const [logs, setLogs] = useState<{ id: number; ts: string; text: string }[]>([]);
  const logRef = useRef<HTMLDivElement | null>(null);
  const logSeq = useRef(0);

  const dispRpm = Math.round(rpm + Math.sin(wave) * 6 + Math.cos(wave * 1.3) * 2);
  const dispTemp = (temp + Math.sin(wave * 0.9) * 0.45 + Math.cos(wave * 1.1) * 0.2).toFixed(1);
  const dispFlow = (flow + Math.sin(wave) * 0.06 + Math.cos(wave * 1.4) * 0.04).toFixed(2);
  const dispLevel = Math.round(level + Math.sin(wave * 0.85) * 0.9 + Math.cos(wave) * 0.5);
  const dispLat = Math.round(latency + Math.sin(wave * 1.2) * 1.8 + Math.cos(wave * 0.7));

  const appendLog = useCallback((text: string) => {
    const ts = new Date().toLocaleTimeString("pt-BR", { hour12: false });
    logSeq.current += 1;
    setLogs((prev) => [{ id: logSeq.current, ts, text }, ...prev].slice(0, 28));
  }, []);

  useEffect(() => {
    let idx = 0;
    const id = window.setInterval(() => {
      appendLog(AI_LOG_POOL[idx % AI_LOG_POOL.length]!);
      idx += 1;
    }, 2200);
    return () => window.clearInterval(id);
  }, [appendLog]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = 0;
  }, [logs.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRpm((v) =>
        Math.min(1920, Math.max(1780, Math.round(v + (Math.random() - 0.5) * 22))),
      );
      setTemp((t) => Math.min(86, Math.max(78, Math.round(t + (Math.random() - 0.5) * 2))));
      setFlow((f) =>
        Math.min(4.8, Math.max(3.6, Math.round((f + (Math.random() - 0.5) * 0.15) * 100) / 100)),
      );
      setLevel((l) =>
        Math.min(94, Math.max(82, Math.round(l + (Math.random() - 0.5) * 3))),
      );
      setLatency((ms) =>
        Math.min(48, Math.max(22, Math.round(ms + (Math.random() - 0.5) * 8))),
      );
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    appendLog("AI Brain online — sessão de comando inicializada");
  }, [appendLog]);

  return (
    <section className="relative mx-auto w-full max-w-6xl" aria-labelledby="biju-telemetry-title">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </span>
              <span className={`${mono} text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300`}>
                Monitoramento ativo
              </span>
            </span>
            <span className={`${mono} text-[9px] text-[#00d4ff]/55`}>núcleo IA · lumen-core</span>
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#00d4ff]/70">Transmissão ao vivo · simulação</p>
          <h2 id="biju-telemetry-title" className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
            Painel de Telemetria
          </h2>
        </div>
        <p className={`${mono} text-[11px] text-[#00d4ff]/60`}>uplink · sim · jitter ±2s</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className={panel}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00d4ff]/80">Módulo de Propulsão</p>
              <dl className={`mt-4 space-y-3 ${mono} text-sm text-white`}>
                <div className="flex items-baseline justify-between gap-4 border-b border-[#00d4ff]/15 pb-2">
                  <dt className="text-xs text-gray-500">RPM</dt>
                  <dd className="text-lg text-[#00d4ff]">
                    <span className="biju-tm-val">{dispRpm}</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs text-gray-500">Temp</dt>
                  <dd className="text-lg text-white">
                    <span className="biju-tm-val biju-tm-val--slow">{dispTemp}°C</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className={panel}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00d4ff]/80">Fluxo Químico (Eco-Bocal)</p>
              <dl className={`mt-4 space-y-3 ${mono} text-sm text-white`}>
                <div className="flex items-baseline justify-between gap-4 border-b border-[#00d4ff]/15 pb-2">
                  <dt className="text-xs text-gray-500">Vazão</dt>
                  <dd className="text-lg text-[#00d4ff]">
                    <span className="biju-tm-val">{dispFlow} L/min</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs text-gray-500">Nível</dt>
                  <dd className="text-lg text-white">
                    <span className="biju-tm-val biju-tm-val--slow">{dispLevel}%</span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className={panel}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#00d4ff]/80">Conectividade</p>
              <dl className={`mt-4 space-y-3 ${mono} text-sm text-white`}>
                <div className="flex items-baseline justify-between gap-4 border-b border-[#00d4ff]/15 pb-2">
                  <dt className="text-xs text-gray-500">Latência Starlink</dt>
                  <dd className="text-lg text-[#00d4ff]">
                    <span className="biju-tm-val">{dispLat}ms</span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd className="text-lg font-bold uppercase tracking-wider text-emerald-400">
                    <span className="biju-tm-val">ONLINE</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <PerformanceSparkline tick={tick} />

          <div className="lg:hidden">
            <EmergencyShutdownButton />
          </div>
        </div>

        <aside
          className="flex w-full shrink-0 flex-col rounded-xl border border-[#00d4ff]/25 bg-[#0a0a0a] p-4 shadow-[0_0_32px_rgba(0,212,255,0.08)] backdrop-blur-md lg:max-w-[17.5rem]"
          aria-label="Logs de IA — AI Brain"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#00d4ff]/90">Logs de IA</p>
          <p className={`mt-1 ${mono} text-[9px] uppercase tracking-wider text-[#00d4ff]/50`}>AI Brain · comando operacional</p>
          <p className={`mt-1 ${mono} text-[9px] text-gray-500`}>stream automático · somente leitura</p>
          <div
            ref={logRef}
            className={`mt-3 max-h-[min(52vh,24rem)] min-h-[12rem] flex-1 space-y-2 overflow-y-auto scroll-smooth rounded-lg border border-[#00d4ff]/20 bg-black/60 p-2.5 ${mono} text-[9px] leading-relaxed text-[#7fe8ff]/95 [scrollbar-width:thin]`}
          >
            {logs.length === 0 ? (
              <p className="px-1 py-2 text-gray-600">Iniciando núcleo de IA…</p>
            ) : (
              logs.map((entry) => (
                <div key={entry.id} className="border-b border-[#00d4ff]/10 pb-2 last:border-0">
                  <span className="text-gray-500">{entry.ts}</span>{" "}
                  <span className="text-[#aef7ff]/95">{entry.text}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 hidden lg:block">
            <EmergencyShutdownButton />
          </div>
        </aside>
      </div>
    </section>
  );
}

function EmergencyShutdownButton() {
  return (
    <button
      type="button"
      className="group w-full rounded-lg border border-red-600/60 bg-gradient-to-b from-red-600 to-red-700 px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_0_28px_rgba(239,68,68,0.5)] animate-pulse transition hover:from-red-500 hover:to-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
      onClick={() => {
        window.alert("Simulação: parada emergencial não armada neste ambiente de demonstração.");
      }}
    >
      SHUTDOWN EMERGENCIAL
    </button>
  );
}
