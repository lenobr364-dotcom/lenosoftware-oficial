import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import {
  calculateCostPerTon,
  calculateMachineHourCost,
} from "@/lib/britagrid/calculators";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("cost_per_ton"),
    totalCostBrl: z.number(),
    tons: z.number(),
  }),
  z.object({
    mode: z.literal("machine_hour"),
    rentalCostBrl: z.number(),
    machineHours: z.number(),
    extrasBrl: z.number().optional(),
  }),
]);

/** Calculadoras BritaGrid (custo/t e hora-máquina) — independentes do ChemVault. */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Informe mode cost_per_ton ou machine_hour com campos numéricos.",
        scope: "britagrid.calc.POST",
        cause: parsed.error,
      });
    }

    if (parsed.data.mode === "cost_per_ton") {
      return NextResponse.json({
        ok: true,
        mode: "cost_per_ton",
        result: calculateCostPerTon(parsed.data),
      });
    }

    return NextResponse.json({
      ok: true,
      mode: "machine_hour",
      result: calculateMachineHourCost(parsed.data),
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "britagrid_calc_failed",
      message: "Falha no cálculo BritaGrid.",
      scope: "britagrid.calc.POST",
      cause,
    });
  }
}
