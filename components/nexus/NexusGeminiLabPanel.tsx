"use client";

import { useState } from "react";

import { ChemVaultNexus, type LicenseAudit } from "@/lib/chemvault-nexus";
import { ChemVaultRevenue, type FormulaBatch, type LabProfitResult } from "@/lib/chemvault-revenue";
import { ChemicalSimulator, type SimulationParams, type SimulationResult } from "@/lib/gemini-lab-thermal";
import { NexusVisualEngine } from "@/lib/nexus-visual-engine";
import { NexusVisualRenderer } from "@/lib/nexus-visual-renderer";

const DEFAULT_PARAMS: SimulationParams = {
  formulaName: "ChemVault_Alfa_Limpeza",
  density: 1.05,
  currentTempCelsius: 24.5,
  flashPointCelsius: 38.0,
};

function statusTone(status: SimulationResult["status"]) {
  if (status === "RISCO_DE_FULGOR") {
    return "border-rose-400/40 bg-rose-500/12 text-rose-200";
  }
  if (status === "ALERTA_CRÍTICO") {
    return "border-amber-400/40 bg-amber-500/12 text-amber-200";
  }
  return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
}

export function NexusGeminiLabPanel() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [audit, setAudit] = useState<LicenseAudit | null>(null);
  const [labProfit, setLabProfit] = useState<LabProfitResult | null>(null);
  const [costPerLicense, setCostPerLicense] = useState(24_500);
  const [operationalCost, setOperationalCost] = useState(1_850);
  const shell = NexusVisualEngine.GLASS_PANEL_CLASS;
  const labView = NexusVisualRenderer.getLaboratoryMeta();

  function runBench() {
    const r = ChemicalSimulator.executeThermalAnalysis(params);
    const a = ChemVaultNexus.processLicensing(r);
    const batch: FormulaBatch = {
      batchId: `BATCH-${Date.now().toString(36).slice(-6).toUpperCase()}`,
      formulaName: params.formulaName,
      costPerLicense,
      operationalCost,
    };
    const profit = ChemVaultRevenue.calculateLabProfit(a, batch);
    setResult(r);
    setAudit(a);
    setLabProfit(profit);
    NexusVisualEngine.renderDashboard(a, r);
    if (typeof window !== "undefined") {
      ChemVaultRevenue.processLabProfit(a, batch);
    }
  }

  return (
    <div className="space-y-6">
      <header className={`${shell} p-6 md:p-8`}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
          NEXUS CORE Â· Glassmorphism
        </p>
        <h2 className="mt-2 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          <span className="text-3xl" aria-hidden>
            â™Š
          </span>
          Gemini Digital Lab
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          World-class thermal bench + Nexus licensing Â· min. {ChemVaultNexus.MIN_SAFETY_INDEX}% Â· ESTÃVEL
        </p>
        <p className="mt-2 font-mono text-[10px] text-neutral-500">
          {NexusVisualEngine.THEME.backdropFilter}
        </p>
      </header>

      <section className={`${shell} p-6`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200/80">
          {labView.systemName}
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          {labView.environment} · {labView.style}
        </p>
        <ul className="mt-4 space-y-2">
          {labView.equipment.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
            >
              <span className="text-neutral-200">{item.label}</span>
              <span
                className={
                  item.active
                    ? "text-[10px] font-semibold uppercase tracking-wider text-emerald-300"
                    : "text-neutral-500"
                }
              >
                {item.detail}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[10px] text-neutral-500">
          Renderizacao 3D / glass · {labView.designer} · {labView.engineer}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${shell} p-6`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/80">Proveta digital</p>
          <label className="mt-4 block text-xs text-neutral-500">FÃ³rmula</label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={params.formulaName}
            onChange={(e) => setParams((p) => ({ ...p, formulaName: e.target.value }))}
          />
          <label className="mt-3 block text-xs text-neutral-500">Densidade (g/cmÂ³)</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={params.density}
            onChange={(e) => setParams((p) => ({ ...p, density: Number(e.target.value) }))}
          />
          <label className="mt-3 block text-xs text-neutral-500">Temp. atual (Â°C)</label>
          <input
            type="number"
            step="0.1"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={params.currentTempCelsius}
            onChange={(e) => setParams((p) => ({ ...p, currentTempCelsius: Number(e.target.value) }))}
          />
          <label className="mt-3 block text-xs text-neutral-500">Ponto de fulgor (Â°C)</label>
          <input
            type="number"
            step="0.1"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={params.flashPointCelsius}
            onChange={(e) => setParams((p) => ({ ...p, flashPointCelsius: Number(e.target.value) }))}
          />
          <label className="mt-3 block text-xs text-neutral-500">Contrato licenca (R$)</label>
          <input
            type="number"
            step="100"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={costPerLicense}
            onChange={(e) => setCostPerLicense(Number(e.target.value))}
          />
          <label className="mt-3 block text-xs text-neutral-500">Custo operacional lab (R$)</label>
          <input
            type="number"
            step="50"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={operationalCost}
            onChange={(e) => setOperationalCost(Number(e.target.value))}
          />
          <button
            type="button"
            onClick={runBench}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500/90 to-violet-500/90 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            Executar bancada NEXUS
          </button>
          <p className="mt-3 text-[10px] text-neutral-500">
            Receita 50/50 do lab apenas. Servicos externos usam ledger separado.
          </p>
        </div>

        <div className="space-y-6">
          <div className={`${shell} p-6`}>
            <p className="text-xs uppercase tracking-wider text-cyan-200/75">Monitor de performance</p>
            {result ? (
              <div className="mt-4 space-y-2 text-sm">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(result.status)}`}
                >
                  {result.status}
                </span>
                <p className="text-amber-100">Seguranca: {result.safetyIndex}</p>
                <p className="text-neutral-400">Margem: {result.thermalMarginCelsius} C</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">Execute a bancada.</p>
            )}
          </div>
          <div className={`${shell} p-6`}>
            <p className="text-xs uppercase tracking-wider text-violet-200/80">Licenciamento NEXUS</p>
            {audit ? (
              <div className="mt-4 space-y-2 text-sm">
                <p
                  className={`text-lg font-bold ${audit.isApproved ? "text-emerald-300" : "text-rose-300"}`}
                >
                  {audit.isApproved ? "APPROVED" : "REJECTED"}
                </p>
                <p className="font-mono text-xs text-cyan-100">{audit.licenseID}</p>
                <p className="text-neutral-400">{audit.reason}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">Aguardando NEXUS.</p>
            )}
          </div>
          <div className={`${shell} p-6`}>
            <p className="text-xs uppercase tracking-wider text-emerald-200/80">Rendimento lab (50/50)</p>
            {labProfit?.kind === "credited" ? (
              <div className="mt-4 space-y-2 text-sm tabular-nums">
                <p className="text-neutral-400">Bruto: R$ {labProfit.finances.grossIncome.toFixed(2)}</p>
                <p className="text-neutral-400">Custo op.: R$ {labProfit.finances.operationalCost.toFixed(2)}</p>
                <p className="text-white">Liquido: R$ {labProfit.finances.netLabIncome.toFixed(2)}</p>
                <p className="text-cyan-100">Leno: R$ {labProfit.finances.partnerShareLeno.toFixed(2)}</p>
                <p className="text-violet-200">Lumen: R$ {labProfit.finances.partnerShareLumen.toFixed(2)}</p>
              </div>
            ) : labProfit?.kind === "rejected" ? (
              <p className="mt-4 text-sm text-rose-300">{labProfit.message}</p>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">Aguardando aprovacao.</p>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] uppercase tracking-[0.35em] text-neutral-600">
        Designed by Leno Cesar and Lumen Onel
      </p>
    </div>
  );
}


