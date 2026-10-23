"use client";

import { GlassPanel } from "@/components/lab/design-system";
import type { ScenarioId } from "@/lib/simulation-hub/types";
import { AlertTriangle, CheckCircle2, Lock, ShieldAlert, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

type ScenarioControllerProps = {
  running: ScenarioId | null;
  lastResult: { scenario: ScenarioId; ok: boolean; error?: string } | null;
  onRun: (scenario: ScenarioId) => void;
};

const SCENARIOS: {
  id: ScenarioId;
  icon: typeof Zap;
  accent: string;
}[] = [
  {
    id: "issue_approve",
    icon: CheckCircle2,
    accent: "border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10",
  },
  {
    id: "vault_unlock",
    icon: Lock,
    accent: "border-cyan-400/30 hover:border-cyan-400/50 hover:bg-cyan-500/10",
  },
  {
    id: "intrusion_denied",
    icon: ShieldAlert,
    accent: "border-rose-400/35 hover:border-rose-400/55 hover:bg-rose-500/10",
  },
];

export function ScenarioController({ running, lastResult, onRun }: ScenarioControllerProps) {
  const t = useTranslations("SimulationHub");

  return (
    <GlassPanel className="flex h-full min-h-[28rem] flex-col p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-violet-300/75">
          {t("controllerEyebrow")}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{t("controllerTitle")}</h2>
        <p className="mt-1 text-sm text-white/45">{t("controllerSubtitle")}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {SCENARIOS.map(({ id, icon: Icon, accent }) => {
          const isRunning = running === id;
          return (
            <button
              key={id}
              type="button"
              disabled={running !== null}
              onClick={() => onRun(id)}
              className={[
                "group flex w-full flex-col items-start gap-2 rounded-2xl border bg-white/[0.04] p-4 text-left backdrop-blur-xl transition",
                "disabled:cursor-not-allowed disabled:opacity-55",
                accent,
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  <Icon className="h-4 w-4 text-white/80" aria-hidden />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white/85">
                  {t(`scenario_${id}_title`)}
                </span>
              </span>
              <span className="text-xs leading-relaxed text-white/45">{t(`scenario_${id}_desc`)}</span>
              {isRunning ? (
                <span className="text-[0.62rem] font-semibold uppercase tracking-wider text-cyan-300/80">
                  {t("scenarioRunning")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {lastResult ? (
        <div
          className={[
            "mt-4 flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-sm",
            lastResult.ok
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-500/10 text-rose-100",
          ].join(" ")}
        >
          {lastResult.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <div>
            <p className="font-medium">{t(`scenario_${lastResult.scenario}_result_${lastResult.ok ? "ok" : "fail"}`)}</p>
            {lastResult.error ? <p className="mt-0.5 text-xs opacity-80">{lastResult.error}</p> : null}
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}
