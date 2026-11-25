"use client";

import { useState } from "react";

import {
  calculateCostPerTon,
  calculateMachineHourCost,
} from "@/lib/britagrid/calculators";

const field =
  "w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-white/35 focus:border-amber-500/40";

export function BritagridCalculators() {
  const [totalCost, setTotalCost] = useState(12000);
  const [tons, setTons] = useState(400);
  const [rental, setRental] = useState(8500);
  const [hours, setHours] = useState(10);
  const [extras, setExtras] = useState(1500);

  const perTon = calculateCostPerTon({ totalCostBrl: totalCost, tons });
  const perHour = calculateMachineHourCost({
    rentalCostBrl: rental,
    machineHours: hours,
    extrasBrl: extras,
  });

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
          Custo / tonelada
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Dimensionamento operacional — não altera a calculadora química ChemVault.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-white/45">
            Custo total (BRL)
            <input
              className={`${field} mt-1`}
              type="number"
              min={0}
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs text-white/45">
            Toneladas
            <input
              className={`${field} mt-1`}
              type="number"
              min={0}
              value={tons}
              onChange={(e) => setTons(Number(e.target.value))}
            />
          </label>
          <p className="rounded-lg border border-white/8 bg-black/30 px-3 py-3 text-lg font-medium text-white">
            {perTon.costPerTonBrl != null
              ? `R$ ${perTon.costPerTonBrl.toFixed(2)} / t`
              : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
          Hora-máquina
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Locação + extras divididos pelas horas efetivas de máquina.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-xs text-white/45">
            Locação (BRL)
            <input
              className={`${field} mt-1`}
              type="number"
              min={0}
              value={rental}
              onChange={(e) => setRental(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs text-white/45">
            Horas de máquina
            <input
              className={`${field} mt-1`}
              type="number"
              min={0}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </label>
          <label className="block text-xs text-white/45">
            Extras (BRL)
            <input
              className={`${field} mt-1`}
              type="number"
              min={0}
              value={extras}
              onChange={(e) => setExtras(Number(e.target.value))}
            />
          </label>
          <p className="rounded-lg border border-white/8 bg-black/30 px-3 py-3 text-lg font-medium text-white">
            {perHour.costPerMachineHourBrl != null
              ? `R$ ${perHour.costPerMachineHourBrl.toFixed(2)} / h`
              : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
