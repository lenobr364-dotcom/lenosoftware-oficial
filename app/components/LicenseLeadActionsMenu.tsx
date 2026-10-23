"use client";

import { updateLicenseRequestStatus, type LicenseRequestStatusAction } from "@/actions/license";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export type LicenseLeadActionsLabels = {
  trigger: string;
  menuAria: string;
  markPending: string;
  approve: string;
  reject: string;
};

type LicenseLeadActionsMenuProps = {
  leadId: string;
  labels: LicenseLeadActionsLabels;
};

export function LicenseLeadActionsMenu({ leadId, labels }: LicenseLeadActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function applyStatus(status: LicenseRequestStatusAction) {
    startTransition(() => {
      void (async () => {
        const result = await updateLicenseRequestStatus(leadId, status);
        setOpen(false);
        if (result.ok) {
          router.refresh();
          return;
        }
        if (result.error === "Unauthorized.") {
          router.push("/login");
          router.refresh();
        }
      })();
    });
  }

  return (
    <div ref={wrapRef} className="relative flex justify-end">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={labels.menuAria}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition",
          "border-white/10 bg-white/[0.05] text-neutral-300 backdrop-blur-sm",
          "hover:border-white/18 hover:bg-white/[0.09] hover:text-neutral-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/35",
          open ? "border-amber-400/25 bg-white/[0.08] text-neutral-100" : "",
          isPending ? "cursor-wait opacity-70" : "",
        ].join(" ")}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-300/80" aria-hidden />
        ) : (
          <MoreHorizontal className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
        )}
        <span>{labels.trigger}</span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-[60] mt-2 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/12 bg-black/80 py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.06] backdrop-blur-2xl"
        >
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => applyStatus("Pendente")}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-amber-200/90 transition hover:bg-amber-500/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.45)]" aria-hidden />
            {labels.markPending}
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => applyStatus("Aprovado")}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-emerald-200/95 transition hover:bg-emerald-500/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.45)]" aria-hidden />
            {labels.approve}
          </button>
          <div className="mx-2 my-1 h-px bg-white/[0.08]" aria-hidden />
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => applyStatus("REJECTED")}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-rose-200/90 transition hover:bg-rose-500/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400/90 shadow-[0_0_8px_rgba(251,113,133,0.4)]" aria-hidden />
            {labels.reject}
          </button>
        </div>
      ) : null}
    </div>
  );
}
