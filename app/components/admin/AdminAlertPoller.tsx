"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "chemvault_seen_security_ids";
const POLL_MS = 18_000;

type CriticalRow = { id: string; title: string; detail: string | null; type: string; createdAt: string };

function readSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Iterable<string>) {
  const merged = [...readSeen(), ...ids];
  const trimmed = merged.slice(-200);
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** Alertas críticos (polling) em todo o dashboard autenticado. */
export function AdminAlertPoller() {
  const t = useTranslations("Dashboard.adminMonitor");
  const boot = useRef(false);

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;

    async function poll() {
      try {
        const res = await fetch("/api/admin/alerts", { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { ok?: boolean; critical?: CriticalRow[] };
        if (!data.ok || !data.critical?.length) return;
        const seen = readSeen();
        if (seen.size === 0) {
          writeSeen(data.critical.map((r) => r.id));
          return;
        }
        const fresh = data.critical.filter((c) => !seen.has(c.id));
        if (fresh.length === 0) return;
        for (const row of fresh) {
          toast.error(t("alertToast", { title: row.title }), { id: `sec-${row.id}`, duration: 9000 });
        }
        writeSeen(fresh.map((r) => r.id));
      } catch {
        /* ignore */
      }
    }

    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(id);
  }, [t]);

  return null;
}
