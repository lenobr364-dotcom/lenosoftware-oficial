/**
 * Executor de rotinas de automação em segundo plano.
 */

import { randomUUID } from "crypto";

import {
  sweepStaleAgents,
  listAgents,
  countAgentConnectivity,
} from "@/lib/lab/intelligence/agent-registry";
import { publishBusEvent } from "@/lib/lab/intelligence/module-bus";
import { mutateIntelligenceState } from "@/lib/lab/intelligence/persistence";
import { completeProcessForRoutine, runProcessWithRoutine } from "@/lib/lab/intelligence/automation-helpers";
import { evaluateIntelligenceRules } from "@/lib/lab/intelligence/rules-engine";
import type {
  AutomationRoutine,
  AutomationRunRecord,
  LabRuleContext,
  RuleEvaluationResult,
} from "@/lib/lab/intelligence/types";
import { NexusAutonomousAgent } from "@/lib/nexus-autonomous-agent";
import { fetchLabDashboardRawStats } from "@/lib/db/repositories/lab-dashboard.repository";

export const AUTOMATION_ROUTINES: AutomationRoutine[] = [
  {
    id: "license-health-scan",
    name: "Varredura de saúde de licenças",
    description: "Avalia métricas do catálogo e dispara regras + eventos no barramento.",
    intervalMinutes: 15,
    enabled: true,
    tags: ["licensing", "rules"],
  },
  {
    id: "agent-heartbeat-sweep",
    name: "Sincronização de agentes",
    description: "Marca agentes sem heartbeat como offline e publica status.",
    intervalMinutes: 5,
    enabled: true,
    tags: ["agents"],
  },
  {
    id: "nexus-shift-report",
    name: "Relatório autônomo NEXUS",
    description: "Gera snapshot do agente autônomo legado (turno Gemini).",
    intervalMinutes: 60,
    enabled: true,
    tags: ["nexus", "report"],
  },
  {
    id: "module-sync-pulse",
    name: "Pulso de sincronização modular",
    description: "Broadcast para módulos consumirem estado agregado.",
    intervalMinutes: 10,
    enabled: true,
    tags: ["bus", "sync"],
  },
];

function routineById(id: string): AutomationRoutine | undefined {
  return AUTOMATION_ROUTINES.find((r) => r.id === id);
}

export function listAutomationRoutines(): AutomationRoutine[] {
  return AUTOMATION_ROUTINES;
}

export async function buildRuleContext(): Promise<LabRuleContext> {
  const stats = await fetchLabDashboardRawStats();
  const agents = await listAgents();
  const connectivity = countAgentConnectivity(agents);
  const licensedRatio =
    stats.totalFormulas > 0 ? stats.licensedFormulas / stats.totalFormulas : 0;

  return {
    timestamp: new Date().toISOString(),
    totalFormulas: stats.totalFormulas,
    licensedFormulas: stats.licensedFormulas,
    activeIndustrialLicenses: stats.activeIndustrialLicenses,
    pendingLicenseRequests: stats.pendingLicenseRequests,
    impressionsToday: stats.impressionsToday,
    dbPingMs: stats.dbPingMs,
    licensedRatio,
    onlineAgents: connectivity.online,
    staleAgents: connectivity.stale,
  };
}

async function applyRuleOutcomes(
  results: RuleEvaluationResult[],
  source: string,
): Promise<void> {
  for (const result of results) {
    if (!result.busTopic) continue;
    await publishBusEvent(result.busTopic, source, {
      ruleId: result.ruleId,
      decision: result.decision,
      severity: result.severity,
      message: result.message,
    });
  }
}

async function recordAutomationRun(
  routineId: string,
  success: boolean,
  summary: string,
  decisionsCount: number,
): Promise<AutomationRunRecord> {
  const record: AutomationRunRecord = {
    id: randomUUID(),
    routineId,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    success,
    summary,
    decisionsCount,
  };

  await mutateIntelligenceState((state) => ({
    ...state,
    automationRuns: [...state.automationRuns, record],
  }));

  return record;
}

async function executeLicenseHealthScan(): Promise<AutomationRunRecord> {
  const process = await runProcessWithRoutine("license-health-scan", "Varredura de saúde de licenças");

  try {
    const ctx = await buildRuleContext();
    const results = evaluateIntelligenceRules(ctx);
    await applyRuleOutcomes(results, "automation:license-health-scan");
    await publishBusEvent("lab.intelligence.rules.evaluated", "automation:license-health-scan", {
      matchedCount: results.length,
      context: ctx,
    });
    await completeProcessForRoutine(process.id, true, `Regras disparadas: ${results.length}`);
    return recordAutomationRun(
      "license-health-scan",
      true,
      `Avaliação concluída — ${results.length} regra(s) ativa(s).`,
      results.length,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "license_health_failed";
    await completeProcessForRoutine(process.id, false, msg);
    return recordAutomationRun("license-health-scan", false, msg, 0);
  }
}

async function executeAgentHeartbeatSweep(): Promise<AutomationRunRecord> {
  const process = await runProcessWithRoutine("agent-heartbeat-sweep", "Sincronização de agentes");

  try {
    const swept = await sweepStaleAgents();
    const agents = await listAgents();
    const connectivity = countAgentConnectivity(agents);

    await publishBusEvent("lab.agents.connectivity", "automation:agent-heartbeat-sweep", {
      swept,
      ...connectivity,
      total: agents.length,
    });

    await completeProcessForRoutine(process.id, true, `Agentes atualizados: ${swept} offline`);
    return recordAutomationRun(
      "agent-heartbeat-sweep",
      true,
      `${connectivity.online} online · ${connectivity.offline} offline (${swept} atualizados)`,
      swept,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "agent_sweep_failed";
    await completeProcessForRoutine(process.id, false, msg);
    return recordAutomationRun("agent-heartbeat-sweep", false, msg, 0);
  }
}

async function executeNexusShiftReport(): Promise<AutomationRunRecord> {
  const process = await runProcessWithRoutine("nexus-shift-report", "Relatório autônomo NEXUS");

  try {
    const report = NexusAutonomousAgent.startShift(undefined, false);
    const filePath = await NexusAutonomousAgent.persistShiftReport(report);
    await publishBusEvent("lab.nexus.shift.completed", "automation:nexus-shift-report", {
      approvedCount: report.approvedCount,
      totalProfitBRL: report.totalProfitBRL,
      exportPath: filePath,
    });
    await completeProcessForRoutine(process.id, true, "Relatório persistido");
    return recordAutomationRun(
      "nexus-shift-report",
      true,
      `Turno registrado — lucro R$ ${report.totalProfitBRL.toFixed(2)}`,
      report.approvedCount,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "shift_report_failed";
    await completeProcessForRoutine(process.id, false, msg);
    return recordAutomationRun("nexus-shift-report", false, msg, 0);
  }
}

async function executeModuleSyncPulse(): Promise<AutomationRunRecord> {
  const process = await runProcessWithRoutine("module-sync-pulse", "Pulso de sincronização modular");

  try {
    const ctx = await buildRuleContext();
    await publishBusEvent("lab.modules.sync", "automation:module-sync-pulse", {
      snapshot: ctx,
      modules: ["vault", "licensing", "gemini-lab", "telemetry", "intelligence"],
    });
    await completeProcessForRoutine(process.id, true, "Pulso publicado no barramento");
    return recordAutomationRun("module-sync-pulse", true, "Broadcast modular concluído", 0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "sync_pulse_failed";
    await completeProcessForRoutine(process.id, false, msg);
    return recordAutomationRun("module-sync-pulse", false, msg, 0);
  }
}

const EXECUTORS: Record<string, () => Promise<AutomationRunRecord>> = {
  "license-health-scan": executeLicenseHealthScan,
  "agent-heartbeat-sweep": executeAgentHeartbeatSweep,
  "nexus-shift-report": executeNexusShiftReport,
  "module-sync-pulse": executeModuleSyncPulse,
};

export async function runAutomationRoutine(routineId: string): Promise<{
  routine: AutomationRoutine;
  run: AutomationRunRecord;
}> {
  const routine = routineById(routineId);
  if (!routine) throw new Error("routine_not_found");
  if (!routine.enabled) throw new Error("routine_disabled");

  const executor = EXECUTORS[routineId];
  if (!executor) throw new Error("routine_executor_missing");

  const run = await executor();
  return { routine, run };
}

/** Tick global — executa rotinas cujo intervalo já venceu desde o último tick. */
export async function runAutomationTick(force = false): Promise<{
  ran: string[];
  skipped: string[];
}> {
  const state = await mutateIntelligenceState((s) => ({
    ...s,
    lastTickAt: new Date().toISOString(),
  }));

  const lastTick = state.lastTickAt ? Date.parse(state.lastTickAt) : 0;
  const ran: string[] = [];
  const skipped: string[] = [];

  for (const routine of AUTOMATION_ROUTINES) {
    if (!routine.enabled) {
      skipped.push(routine.id);
      continue;
    }

    const lastRun = [...state.automationRuns]
      .reverse()
      .find((r) => r.routineId === routine.id);

    const lastRunMs = lastRun ? Date.parse(lastRun.completedAt) : 0;
    const due = force || Date.now() - lastRunMs >= routine.intervalMinutes * 60_000;

    if (!due) {
      skipped.push(routine.id);
      continue;
    }

    await runAutomationRoutine(routine.id);
    ran.push(routine.id);
  }

  return { ran, skipped };
}
