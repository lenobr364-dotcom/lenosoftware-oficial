"use client";

import type { LabDashboardPayload } from "@/lib/services/lab-dashboard.service";
import {
  initialLabDashboardState,
  type LabDashboardActions,
  type LabDashboardState,
} from "@/lib/state/lab-dashboard.types";
import { useLocale } from "next-intl";
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

type LabDataContextValue = LabDashboardState & LabDashboardActions;

const LabDataContext = createContext<LabDataContextValue | null>(null);

async function fetchDashboard(locale: string, signal?: AbortSignal): Promise<LabDashboardPayload> {
  const res = await fetch(`/api/nexus/lab/dashboard?locale=${encodeURIComponent(locale)}`, {
    signal,
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  const json = (await res.json()) as { ok: boolean; data: LabDashboardPayload };
  if (!json.ok || !json.data) throw new Error("invalid_payload");
  return json.data;
}

export function LabDataProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [state, setState] = useState<LabDashboardState>(initialLabDashboardState);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const data = await fetchDashboard(locale, controller.signal);
      setState({
        data,
        loading: false,
        error: null,
        lastFetchedAt: Date.now(),
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "fetch_failed",
      }));
    }
  }, [locale]);

  useEffect(() => {
    const boot = async () => {
      await fetch("/api/nexus/lab/hq/attest", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      }).catch(() => undefined);
      await refresh();
    };
    void boot();
    return () => abortRef.current?.abort();
  }, [refresh]);

  const value = useMemo<LabDataContextValue>(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );

  return <LabDataContext.Provider value={value}>{children}</LabDataContext.Provider>;
}

export function useLabData(): LabDataContextValue {
  const ctx = useContext(LabDataContext);
  if (!ctx) {
    throw new Error("useLabData must be used within LabDataProvider");
  }
  return ctx;
}
