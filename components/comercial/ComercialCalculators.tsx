"use client";

import { useState } from "react";

import {
  calculateCostPerTon,
  calculateMachineHourCost,
} from "@/lib/anti-disintermediation/calculators";

const field =
  "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/40";

export function ComercialCalculators() {
  const [totalCost, setTotalCost] = useState("10000");
  const [tons, setTons] = useState("250");
  const [rental, setRental] = useState("8000");
  const [hours, setHours] = useState("10");
  const [extras, setExtras] = useState("2000");

  const ton = calculateCostPerTon({
    totalCostBrl: Number(totalCost),
    tons: Number(tons),
  });
  const hour = calculateMachineHourCost({
    rentalCostBrl: Number(rental),
    machineHours: Number(hours),
    extrasBrl: Number(extras),
  });

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/70 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
          Custo / tonelada
        </p>
        <div className="mt-4 grid gap-3">
          <label className="text-xs text-zinc-400">
            Custo total (BRL)
            <input className={`${field} mt-1`} value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
          </label>
          <label className="text-xs text-zinc-400">
            Toneladas
            <input className={`${field} mt-1`} value={tons} onChange={(e) => setTons(e.target.value)} />
          </label>
          <p className="font-mono text-xl text-amber-100">
            {ton.costPerTonBrl == null ? "—" : `R$ ${ton.costPerTonBrl.toFixed(2)}/t`}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-500/20 bg-zinc-950/70 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
          Hora-máquina
        </p>
        <div className="mt-4 grid gap-3">
          <label className="text-xs text-zinc-400">
            Locação (BRL)
            <input className={`${field} mt-1`} value={rental} onChange={(e) => setRental(e.target.value)} />
          </label>
          <label className="text-xs text-zinc-400">
            Horas
            <input className={`${field} mt-1`} value={hours} onChange={(e) => setHours(e.target.value)} />
          </label>
          <label className="text-xs text-zinc-400">
            Extras (BRL)
            <input className={`${field} mt-1`} value={extras} onChange={(e) => setExtras(e.target.value)} />
          </label>
          <p className="font-mono text-xl text-amber-100">
            {hour.costPerMachineHourBrl == null
              ? "—"
              : `R$ ${hour.costPerMachineHourBrl.toFixed(2)}/h`}
          </p>
        </div>
      </div>
    </section>
  );
}
