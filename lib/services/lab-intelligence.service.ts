/**
 * Serviço de domínio — inteligência do laboratório NEXUS.
 */

import { analyzeFormulaRow } from "@/lib/formula-intelligence/formula-analysis-service";
import {
  buildRuleContext,
  evaluateIntelligenceRules,
  listAutomationRoutines,
  listIntelligenceRules,
  listAgents,
  countAgentConnectivity,
  listProcesses,
  countActiveProcesses,
  listBusEvents,
  runAutomationRoutine,
  runAutomationTick,
  registerAgent,
  recordAgentHeartbeat,
  publishBusEvent,
  type RegisterAgentInput,
} from "@/lib/lab/intelligence";
import { loadIntelligenceState } from "@/lib/lab/intelligence/persistence";
import type { IntelligenceStatusPayload, LabRuleContext } from "@/lib/lab/intelligence/types";
import { prisma } from "@/lib/prisma";

export async function getIntelligenceStatus(): Promise<IntelligenceStatusPayload> {
  const state = await loadIntelligenceState();
  const agents = Object.values(state.agents);
  const connectivity = countAgentConnectivity(agents);
  const processes = await listProcesses({ limit: 8 });
  const recentEvents = await listBusEvents({ limit: 20 });
  const topics = [...new Set(recentEvents.map((e) => e.topic))].slice(0, 8);

  const ctx = await buildRuleContext();
  const lastEval = evaluateIntelligenceRules(ctx);

  return {
    operational: true,
    lastTickAt: state.lastTickAt,
    agents: {
      total: agents.length,
      online: connectivity.online,
      offline: connectivity.offline,
    },
    processes: {
      active: countActiveProcesses(state.processes),
      recent: processes,
    },
    bus: {
      eventCount: state.busEvents.length,
      recentTopics: topics,
    },
    automation: {
      routines: listAutomationRoutines(),
      lastRuns: state.automationRuns.slice(-10).reverse(),
    },
    rules: {
      catalogSize: listIntelligenceRules().length,
      lastEvaluationCount: lastEval.length,
    },
  };
}

export async function evaluateRulesWithOptionalContext(
  partial?: Partial<LabRuleContext>,
): Promise<{ context: LabRuleContext; results: ReturnType<typeof evaluateIntelligenceRules> }> {
  const base = await buildRuleContext();
  const context: LabRuleContext = { ...base, ...partial, timestamp: new Date().toISOString() };
  const results = evaluateIntelligenceRules(context);
  return { context, results };
}

export async function invokeLabAiAction(input: {
  action: "ping" | "decision_summary" | "analyze_formula" | "module_handoff";
  formulaId?: string;
  prompt?: string;
  handoff?: {
    targetModule: string;
    intent: string;
    payload?: Record<string, unknown>;
  };
}): Promise<Record<string, unknown>> {
  switch (input.action) {
    case "ping":
      return {
        ok: true,
        service: "chemvault-lab-intelligence",
        geminiConfigured: Boolean(
          process.env.GEMINI_API_KEY?.trim() ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
        ),
        at: new Date().toISOString(),
      };

    case "decision_summary": {
      const { context, results } = await evaluateRulesWithOptionalContext();
      await publishBusEvent("lab.ai.decision_summary", "ai:invoke", {
        matchedCount: results.length,
        prompt: input.prompt?.slice(0, 500),
      });
      return { context, decisions: results };
    }

    case "analyze_formula": {
      if (!input.formulaId) throw new Error("formula_id_required");
      const row = await prisma.formula.findUnique({ where: { id: input.formulaId } });
      if (!row) throw new Error("formula_not_found");
      const analysis = await analyzeFormulaRow(row);
      await publishBusEvent("lab.ai.formula.analyzed", "ai:invoke", {
        formulaId: row.id,
        provider: analysis.provider,
      });
      return { formulaId: row.id, analysis };
    }

    case "module_handoff": {
      if (!input.handoff) throw new Error("handoff_required");
      const event = await publishBusEvent(
        `lab.handoff.${input.handoff.targetModule}`,
        "ai:invoke",
        {
          intent: input.handoff.intent,
          prompt: input.prompt,
          ...input.handoff.payload,
        },
      );
      return { event };
    }

    default:
      throw new Error("unsupported_action");
  }
}

export {
  registerAgent,
  recordAgentHeartbeat,
  listAgents,
  listProcesses,
  listBusEvents,
  publishBusEvent,
  runAutomationRoutine,
  runAutomationTick,
  listAutomationRoutines,
  listIntelligenceRules,
  type RegisterAgentInput,
};
