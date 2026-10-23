"use client";

import type { IntelligenceStatusPayload } from "@/lib/lab/intelligence/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type LabIntelligenceState = {
  data: IntelligenceStatusPayload | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

type LabIntelligenceContextValue = LabIntelligenceState & {
  refresh: () => Promise<void>;
};

const LabIntelligenceContext = createContext<LabIntelligenceContextValue | null>(null);

async function fetchIntelligenceStatus(signal?: AbortSignal): Promise<IntelligenceStatusPayload> {
  const res = await fetch("/api/nexus/lab/intelligence/status", {
    signal,
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { ok: boolean; data: IntelligenceStatusPayload };
  if (!json.ok || !json.data) throw new Error("invalid_payload");
  return json.data;
}

export function LabIntelligenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LabIntelligenceState>({
    data: null,
    loading: true,
    error: null,
    lastFetchedAt: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const data = await fetchIntelligenceStatus(controller.signal);
      setState({ data, loading: false, error: null, lastFetchedAt: Date.now() });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "fetch_failed",
      }));
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;

    const boot = async () => {
      await fetch("/api/nexus/lab/hq/attest", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      }).catch(() => undefined);

      const startDelay =
        typeof requestIdleCallback === "function"
          ? new Promise<void>((resolve) => requestIdleCallback(() => resolve()))
          : new Promise<void>((resolve) => setTimeout(resolve, 400));

      await startDelay;
      await refresh();
      interval = window.setInterval(() => void refresh(), 60_000);
    };

    void boot();
    return () => {
      if (interval) window.clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [refresh]);

  const value = useMemo<LabIntelligenceContextValue>(() => ({ ...state, refresh }), [state, refresh]);

  return (
    <LabIntelligenceContext.Provider value={value}>{children}</LabIntelligenceContext.Provider>
  );
}

export function useLabIntelligence(): LabIntelligenceContextValue {
  const ctx = useContext(LabIntelligenceContext);
  if (!ctx) {
    throw new Error("useLabIntelligence must be used within LabIntelligenceProvider");
  }
  return ctx;
}
