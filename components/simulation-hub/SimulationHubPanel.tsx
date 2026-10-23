"use client";

import { LiveLedgerViewer, type LiveLedgerViewerHandle } from "@/components/simulation-hub/LiveLedgerViewer";
import { ScenarioController } from "@/components/simulation-hub/ScenarioController";
import { runSimulationScenario } from "@/lib/simulation-hub/run-scenarios";
import type { ScenarioId } from "@/lib/simulation-hub/types";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";

export function SimulationHubPanel() {
  const t = useTranslations("SimulationHub");
  const locale = useLocale();
  const ledgerRef = useRef<LiveLedgerViewerHandle>(null);
  const [running, setRunning] = useState<ScenarioId | null>(null);
  const [lastResult, setLastResult] = useState<{
    scenario: ScenarioId;
    ok: boolean;
    error?: string;
  } | null>(null);
  const [ctx, setCtx] = useState<{ licenseId?: string; formulaId?: string }>({});

  async function handleRun(scenario: ScenarioId) {
    setRunning(scenario);
    setLastResult(null);
    try {
      const result = await runSimulationScenario(scenario, locale, ctx);
      if (result.licenseId) {
        setCtx({ licenseId: result.licenseId, formulaId: result.formulaId });
      }
      setLastResult({ scenario, ok: result.ok, error: result.error });
      await ledgerRef.current?.refresh();
      if (!result.ok) return;
      window.setTimeout(() => void ledgerRef.current?.refresh(), 400);
    } catch {
      setLastResult({ scenario, ok: false, error: "network_error" });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-fuchsia-300/75">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{t("title")}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-white/50">{t("subtitle")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <ScenarioController running={running} lastResult={lastResult} onRun={(id) => void handleRun(id)} />
        <LiveLedgerViewer ref={ledgerRef} pollMs={2_500} />
      </div>
    </div>
  );
}
