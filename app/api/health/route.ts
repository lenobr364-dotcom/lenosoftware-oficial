import { NextResponse } from "next/server";

import { runDatabaseIntegrityProbe } from "@/lib/db-integrity-probe";
import { mintCoreLicenseSession, verifyCoreLicenseSession } from "@/lib/core-license-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export type HealthResponseBody = {
  ok: boolean;
  database: "up" | "down";
  licensing: "up" | "down";
  latencyMs: number;
  timestamp: string;
};

export async function GET() {
  const started = Date.now();
  const timestamp = new Date().toISOString();

  let database: "up" | "down" = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch {
    database = "down";
  }

  if (database === "up") {
    await runDatabaseIntegrityProbe(prisma);
  }

  let licensing: "up" | "down" = "down";
  try {
    const mint = await mintCoreLicenseSession("health:probe", 120);
    const valid = await verifyCoreLicenseSession(mint.token);
    licensing = valid ? "up" : "down";
  } catch {
    licensing = "down";
  }

  const ok = database === "up" && licensing === "up";
  const body: HealthResponseBody = {
    ok,
    database,
    licensing,
    latencyMs: Date.now() - started,
    timestamp,
  };

  return NextResponse.json(body, { status: ok ? 200 : 503 });
}
