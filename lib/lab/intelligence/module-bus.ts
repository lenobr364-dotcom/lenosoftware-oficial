/**
 * Barramento interno — comunicação contínua entre módulos NEXUS/lab.
 */

import { randomUUID } from "crypto";

import { mutateIntelligenceState } from "@/lib/lab/intelligence/persistence";
import type { BusEvent } from "@/lib/lab/intelligence/types";

export async function publishBusEvent(
  topic: string,
  source: string,
  payload: Record<string, unknown>,
): Promise<BusEvent> {
  const event: BusEvent = {
    id: randomUUID(),
    topic,
    source,
    payload,
    at: new Date().toISOString(),
  };

  await mutateIntelligenceState((state) => ({
    ...state,
    busEvents: [...state.busEvents, event],
  }));

  return event;
}

export async function listBusEvents(options?: {
  since?: string;
  topic?: string;
  limit?: number;
}): Promise<BusEvent[]> {
  const { loadIntelligenceState } = await import("@/lib/lab/intelligence/persistence");
  const state = await loadIntelligenceState();
  let events = [...state.busEvents];

  if (options?.since) {
    const sinceMs = Date.parse(options.since);
    events = events.filter((e) => Date.parse(e.at) >= sinceMs);
  }
  if (options?.topic) {
    events = events.filter((e) => e.topic === options.topic || e.topic.startsWith(`${options.topic}.`));
  }

  const limit = options?.limit ?? 50;
  return events.slice(-limit).reverse();
}
