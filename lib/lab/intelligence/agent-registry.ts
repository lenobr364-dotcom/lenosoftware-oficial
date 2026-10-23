/**
 * Registro de agentes autônomos digitais (Gemini, Cursor, integrações custom).
 */

import { randomUUID } from "crypto";

import { mutateIntelligenceState, loadIntelligenceState } from "@/lib/lab/intelligence/persistence";
import type { AgentKind, AgentStatus, RegisteredAgent } from "@/lib/lab/intelligence/types";

const STALE_MS = 5 * 60 * 1000;

export type RegisterAgentInput = {
  agentId?: string;
  name: string;
  kind: AgentKind;
  capabilities?: string[];
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
};

export async function registerAgent(input: RegisterAgentInput): Promise<RegisteredAgent> {
  const id = input.agentId?.trim() || `agent-${randomUUID()}`;
  const now = new Date().toISOString();

  const agent: RegisteredAgent = {
    id,
    name: input.name.trim(),
    kind: input.kind,
    capabilities: input.capabilities ?? [],
    webhookUrl: input.webhookUrl,
    status: "online",
    registeredAt: now,
    lastHeartbeatAt: now,
    metadata: input.metadata,
  };

  await mutateIntelligenceState((state) => ({
    ...state,
    agents: { ...state.agents, [id]: agent },
  }));

  return agent;
}

export async function recordAgentHeartbeat(
  agentId: string,
  patch?: { status?: AgentStatus; metadata?: Record<string, unknown> },
): Promise<RegisteredAgent | null> {
  let updated: RegisteredAgent | null = null;

  await mutateIntelligenceState((state) => {
    const existing = state.agents[agentId];
    if (!existing) return state;

    updated = {
      ...existing,
      status: patch?.status ?? "online",
      lastHeartbeatAt: new Date().toISOString(),
      metadata: patch?.metadata ? { ...existing.metadata, ...patch.metadata } : existing.metadata,
    };

    return {
      ...state,
      agents: { ...state.agents, [agentId]: updated },
    };
  });

  return updated;
}

export async function listAgents(): Promise<RegisteredAgent[]> {
  const state = await loadIntelligenceState();
  return Object.values(state.agents).sort(
    (a, b) => Date.parse(b.registeredAt) - Date.parse(a.registeredAt),
  );
}

export function countAgentConnectivity(agents: RegisteredAgent[]): {
  online: number;
  offline: number;
  stale: number;
} {
  const now = Date.now();
  let online = 0;
  let offline = 0;
  let stale = 0;

  for (const agent of agents) {
    const last = agent.lastHeartbeatAt ? Date.parse(agent.lastHeartbeatAt) : 0;
    const isStale = !last || now - last > STALE_MS;

    if (agent.status === "offline" || isStale) {
      offline += 1;
      if (isStale && agent.status !== "offline") stale += 1;
    } else {
      online += 1;
    }
  }

  return { online, offline, stale };
}

/** Marca agentes sem heartbeat como offline (rotina de automação). */
export async function sweepStaleAgents(): Promise<number> {
  const now = Date.now();
  let swept = 0;

  await mutateIntelligenceState((state) => {
    const agents = { ...state.agents };

    for (const [id, agent] of Object.entries(agents)) {
      const last = agent.lastHeartbeatAt ? Date.parse(agent.lastHeartbeatAt) : 0;
      if (!last || now - last > STALE_MS) {
        if (agent.status !== "offline") {
          agents[id] = { ...agent, status: "offline" };
          swept += 1;
        }
      }
    }

    return { ...state, agents };
  });

  return swept;
}
