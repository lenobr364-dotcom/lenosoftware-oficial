"use client";

import { LabInventorySidebar } from "@/components/digital-laboratory/LabInventorySidebar";
import { LabPropertiesPanel } from "@/components/digital-laboratory/LabPropertiesPanel";
import { LabWorkbench } from "@/components/digital-laboratory/LabWorkbench";
import { getDigitalLabInventory } from "@/lib/digital-laboratory/catalog";
import type { LabComponentCategory, WorkbenchBlendSummary, WorkbenchComponent } from "@/lib/digital-laboratory/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

function newInstanceId(): string {
  return `wb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function computeSummary(components: WorkbenchComponent[]): WorkbenchBlendSummary {
  const totalRatioPct = components.reduce((s, c) => s + c.ratioPct, 0);
  const counts = new Map<LabComponentCategory, number>();
  for (const c of components) {
    const item = getDigitalLabInventory().find((i) => i.id === c.itemId);
    if (!item) continue;
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  let dominantCategory: LabComponentCategory | null = null;
  let max = 0;
  for (const [cat, n] of counts) {
    if (n > max) {
      max = n;
      dominantCategory = cat;
    }
  }
  return {
    totalRatioPct: Math.round(totalRatioPct),
    componentCount: components.length,
    dominantCategory,
  };
}

export function DigitalLaboratoryShell() {
  const t = useTranslations("DigitalLaboratory");
  const inventory = useMemo(() => getDigitalLabInventory(), []);
  const [workbench, setWorkbench] = useState<WorkbenchComponent[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [enteringInstanceId, setEnteringInstanceId] = useState<string | null>(null);
  const [pulseInventoryId, setPulseInventoryId] = useState<string | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const summary = useMemo(() => computeSummary(workbench), [workbench]);

  const selectedWorkbench = workbench.find((c) => c.instanceId === selectedInstanceId) ?? null;
  const selectedInventory =
    inventory.find((i) => i.id === selectedInventoryId) ??
    (selectedWorkbench ? inventory.find((i) => i.id === selectedWorkbench.itemId) : undefined) ??
    null;

  const addToWorkbench = useCallback((itemId: string) => {
    const instanceId = newInstanceId();
    setWorkbench((prev) => [
      ...prev,
      {
        instanceId,
        itemId,
        ratioPct: prev.length === 0 ? 100 : 10,
        temperatureC: 25,
        agitationRpm: 80,
        notes: "",
      },
    ]);
    setSelectedInstanceId(instanceId);
    setSelectedInventoryId(itemId);
    setEnteringInstanceId(instanceId);
    setPulseInventoryId(itemId);
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    enterTimerRef.current = setTimeout(() => setEnteringInstanceId(null), 450);
    pulseTimerRef.current = setTimeout(() => setPulseInventoryId(null), 500);
  }, []);

  const handleInventoryClick = useCallback(
    (itemId: string) => {
      addToWorkbench(itemId);
    },
    [addToWorkbench],
  );

  const handleSimulateMix = useCallback(() => {
    if (workbench.length === 0) return;
    toast.success(t("simulateMixToast"), {
      icon: "⚗️",
      style: {
        borderColor: "rgba(34,211,238,0.35)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 48px -8px rgba(34,211,238,0.45), 0 0 32px -12px rgba(139,92,246,0.25)",
      },
    });
  }, [workbench.length, t]);

  const updateComponent = useCallback((instanceId: string, patch: Partial<WorkbenchComponent>) => {
    setWorkbench((prev) => prev.map((c) => (c.instanceId === instanceId ? { ...c, ...patch } : c)));
  }, []);

  const removeInstance = useCallback((instanceId: string) => {
    setWorkbench((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setSelectedInstanceId((id) => (id === instanceId ? null : id));
  }, []);

  const clearWorkbench = useCallback(() => {
    setWorkbench([]);
    setSelectedInstanceId(null);
  }, []);

  return (
    <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,17rem)_1fr_minmax(0,18rem)] xl:grid-rows-1">
      <div className="order-2 xl:order-1 xl:min-h-0">
        <LabInventorySidebar
          items={inventory}
          selectedItemId={selectedInventoryId}
          pulseItemId={pulseInventoryId}
          onInventoryClick={handleInventoryClick}
        />
      </div>

      <div className="order-1 min-h-[32rem] xl:order-2 xl:min-h-0">
        <LabWorkbench
          components={workbench}
          selectedInstanceId={selectedInstanceId}
          enteringInstanceId={enteringInstanceId}
          summary={summary}
          onSelectInstance={setSelectedInstanceId}
          onRemoveInstance={removeInstance}
        />
      </div>

      <div className="order-3 xl:min-h-0">
        <LabPropertiesPanel
          inventoryItem={selectedInventory}
          workbenchComponent={selectedWorkbench}
          workbenchCount={workbench.length}
          onUpdateComponent={updateComponent}
          onSimulateMix={handleSimulateMix}
          onClearBench={clearWorkbench}
        />
      </div>
    </div>
  );
}

