/**
 * Monitor de processos — rastreia rotinas em segundo plano.
 */

import { randomUUID } from "crypto";

import { mutateIntelligenceState, loadIntelligenceState } from "@/lib/lab/intelligence/persistence";
import type { LabProcess, ProcessStatus } from "@/lib/lab/intelligence/types";

export async function startProcess(input: {
  routineId: string;
  label: string;
  metadata?: Record<string, unknown>;
}): Promise<LabProcess> {
  const now = new Date().toISOString();
  const process: LabProcess = {
    id: randomUUID(),
    routineId: input.routineId,
    label: input.label,
    status: "running",
    startedAt: now,
    updatedAt: now,
    progress: 0,
    logs: [`[${now}] Processo iniciado`],
    metadata: input.metadata,
  };

  await mutateIntelligenceState((state) => ({
    ...state,
    processes: [...state.processes, process],
  }));

  return process;
}

export async function updateProcess(
  processId: string,
  patch: {
    status?: ProcessStatus;
    progress?: number;
    logLine?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<LabProcess | null> {
  let updated: LabProcess | null = null;
  const now = new Date().toISOString();

  await mutateIntelligenceState((state) => {
    const idx = state.processes.findIndex((p) => p.id === processId);
    if (idx < 0) return state;

    const current = state.processes[idx];
    const next: LabProcess = {
      ...current,
      status: patch.status ?? current.status,
      progress: patch.progress ?? current.progress,
      updatedAt: now,
      metadata: patch.metadata ? { ...current.metadata, ...patch.metadata } : current.metadata,
      logs: patch.logLine ? [...current.logs, `[${now}] ${patch.logLine}`] : current.logs,
    };

    if (patch.status === "completed" || patch.status === "failed" || patch.status === "cancelled") {
      next.completedAt = now;
      next.progress = patch.status === "completed" ? 100 : next.progress;
    }

    const processes = [...state.processes];
    processes[idx] = next;
    updated = next;

    return { ...state, processes };
  });

  return updated;
}

export async function listProcesses(filter?: {
  status?: ProcessStatus;
  limit?: number;
}): Promise<LabProcess[]> {
  const state = await loadIntelligenceState();
  let list = [...state.processes].reverse();

  if (filter?.status) {
    list = list.filter((p) => p.status === filter.status);
  }

  return list.slice(0, filter?.limit ?? 40);
}

export function countActiveProcesses(processes: LabProcess[]): number {
  return processes.filter((p) => p.status === "running" || p.status === "pending").length;
}
