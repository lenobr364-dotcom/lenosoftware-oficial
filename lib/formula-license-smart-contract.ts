import { createHash } from "crypto";

import { prisma } from "@/lib/prisma";

/** Identificador lógico do contrato simulado (substituível por endereço EVM real). */
export const SIMULATED_FORMULA_LICENSE_CONTRACT_ID = "chemvault:formula-license:v1";

export type GrantCanonicalPayload = {
  contractId: string;
  clientSubject: string;
  formulaCode: string;
  validFromIso: string;
  validUntilIso: string;
};

export function stableGrantJson(p: GrantCanonicalPayload): string {
  const keys = Object.keys(p).sort() as (keyof GrantCanonicalPayload)[];
  const o: Record<string, string> = {};
  for (const k of keys) {
    o[k] = p[k];
  }
  return JSON.stringify(o);
}

export function computeGrantHash(payload: GrantCanonicalPayload): string {
  return createHash("sha256").update(stableGrantJson(payload), "utf8").digest("hex");
}

/** Âncora “on-chain” simulada (40 hex + prefixo 0x). */
export function computeSimulatedChainAnchor(grantHash: string): string {
  const h = createHash("sha256")
    .update(`ANCHOR|${SIMULATED_FORMULA_LICENSE_CONTRACT_ID}|${grantHash}`, "utf8")
    .digest("hex");
  return `0x${h.slice(0, 40)}`;
}

export async function mintFormulaIndustrialLicense(input: {
  clientSubject: string;
  formulaCode: string;
  validFrom: Date;
  validUntil: Date;
  status?: "ACTIVE" | "PENDING";
}): Promise<{ id: string; grantHash: string; chainAnchor: string }> {
  const payload: GrantCanonicalPayload = {
    contractId: SIMULATED_FORMULA_LICENSE_CONTRACT_ID,
    clientSubject: input.clientSubject.trim(),
    formulaCode: input.formulaCode.trim(),
    validFromIso: input.validFrom.toISOString(),
    validUntilIso: input.validUntil.toISOString(),
  };
  const grantHash = computeGrantHash(payload);
  const chainAnchor = computeSimulatedChainAnchor(grantHash);

  const row = await prisma.formulaIndustrialLicense.create({
    data: {
      clientSubject: payload.clientSubject,
      formulaCode: payload.formulaCode,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      status: input.status ?? "ACTIVE",
      grantHash,
      chainAnchor,
    },
  });
  return { id: row.id, grantHash, chainAnchor };
}

export async function issuePendingFormulaIndustrialLicense(input: {
  clientSubject: string;
  formulaCode: string;
  validFrom: Date;
  validUntil: Date;
}) {
  return mintFormulaIndustrialLicense({ ...input, status: "PENDING" });
}

export async function approveFormulaIndustrialLicense(id: string) {
  const row = await prisma.formulaIndustrialLicense.findUnique({ where: { id } });
  if (!row || row.status !== "PENDING") return null;
  return prisma.formulaIndustrialLicense.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
}

export async function revokeFormulaIndustrialLicense(id: string) {
  const row = await prisma.formulaIndustrialLicense.findUnique({ where: { id } });
  if (!row || row.status === "REVOKED") return null;
  return prisma.formulaIndustrialLicense.update({
    where: { id },
    data: { status: "REVOKED" },
  });
}

export async function listFormulaIndustrialLicenses() {
  return prisma.formulaIndustrialLicense.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function listAllFormulaIndustrialLicensesForEngine() {
  return prisma.formulaIndustrialLicense.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function getFormulaIndustrialLicenseById(id: string) {
  return prisma.formulaIndustrialLicense.findUnique({ where: { id } });
}

export function evaluateLicenseValidity(row: {
  status: string;
  validFrom: Date;
  validUntil: Date;
}): "VALID" | "EXPIRED" | "REVOKED" | "NOT_YET_VALID" {
  if (row.status !== "ACTIVE") return "REVOKED";
  const now = Date.now();
  if (row.validUntil.getTime() < now) return "EXPIRED";
  if (row.validFrom.getTime() > now) return "NOT_YET_VALID";
  return "VALID";
}
