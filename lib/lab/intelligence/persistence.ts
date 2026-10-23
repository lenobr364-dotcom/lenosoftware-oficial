/**
 * Persistência leve (JSON) — estado de agentes, processos e barramento.
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { LabIntelligencePersistedState } from "@/lib/lab/intelligence/types";

const MAX_BUS_EVENTS = 500;
const MAX_PROCESSES = 120;
const MAX_AUTOMATION_RUNS = 80;

const DEFAULT_STATE: LabIntelligencePersistedState = {
  version: 1,
  agents: {},
  processes: [],
  busEvents: [],
  automationRuns: [],
  lastTickAt: null,
};

let memoryState: LabIntelligencePersistedState | null = null;
let writeChain: Promise<void> = Promise.resolve();

function stateDir(): string {
  return path.join(process.cwd(), "chemvault-public", "nexus-lab-intelligence");
}

function stateFilePath(): string {
  return path.join(stateDir(), "state.json");
}

function trimState(state: LabIntelligencePersistedState): LabIntelligencePersistedState {
  return {
    ...state,
    busEvents: state.busEvents.slice(-MAX_BUS_EVENTS),
    processes: state.processes.slice(-MAX_PROCESSES),
    automationRuns: state.automationRuns.slice(-MAX_AUTOMATION_RUNS),
  };
}

export async function loadIntelligenceState(): Promise<LabIntelligencePersistedState> {
  if (memoryState) return memoryState;

  const filePath = stateFilePath();
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as LabIntelligencePersistedState;
    memoryState = trimState({ ...DEFAULT_STATE, ...parsed, version: 1 });
  } catch {
    memoryState = { ...DEFAULT_STATE };
  }

  return memoryState;
}

export async function saveIntelligenceState(
  state: LabIntelligencePersistedState,
): Promise<void> {
  const trimmed = trimState(state);
  memoryState = trimmed;

  writeChain = writeChain.then(async () => {
    const dir = stateDir();
    await mkdir(dir, { recursive: true });
    await writeFile(stateFilePath(), JSON.stringify(trimmed, null, 2), "utf8");
  });

  await writeChain;
}

export async function mutateIntelligenceState(
  mutator: (state: LabIntelligencePersistedState) => LabIntelligencePersistedState,
): Promise<LabIntelligencePersistedState> {
  const current = await loadIntelligenceState();
  const next = mutator(structuredClone(current));
  await saveIntelligenceState(next);
  return next;
}
