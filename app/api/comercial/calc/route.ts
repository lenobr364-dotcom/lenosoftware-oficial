import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonApiError } from "@/lib/api-error-response";
import {
  calculateCostPerTon,
  calculateDetailedProposalCost,
  calculateMachineHourCost,
} from "@/lib/anti-disintermediation/calculators";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("mode", [
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
  z.object({
    mode: z.literal("detailed_proposal"),
    dryMachineHourBrl: z.number(),
    machineHours: z.number(),
    tons: z.number(),
    lithology: z.enum(["arenito", "calcário", "basalto", "granito", "quartzito"]),
    wearBasePerHourBrl: z.number().optional(),
    dieselLitersPerHour: z.number().optional(),
    dieselPricePerLiterBrl: z.number().optional(),
    mobilizationBrl: z.number().optional(),
    demobilizationBrl: z.number().optional(),
  }),
]);

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonApiError(400, {
        error: "invalid_payload",
        message: "Payload de calculadora inválido.",
        scope: "comercial.calc.POST",
        cause: parsed.error,
      });
    }

    if (parsed.data.mode === "cost_per_ton") {
      return NextResponse.json({
        ok: true,
        result: calculateCostPerTon(parsed.data),
      });
    }

    if (parsed.data.mode === "detailed_proposal") {
      return NextResponse.json({
        ok: true,
        result: calculateDetailedProposalCost(parsed.data),
      });
    }

    return NextResponse.json({
      ok: true,
      result: calculateMachineHourCost(parsed.data),
    });
  } catch (cause) {
    return jsonApiError(500, {
      error: "comercial_calc_failed",
      message: "Falha ao calcular.",
      scope: "comercial.calc.POST",
      cause,
    });
  }
}
