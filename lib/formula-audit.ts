import { createHash } from "node:crypto";

import type { Formula, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type FormulaAuditAction = "CREATE" | "UPDATE" | "DELETE";

export function formulaToSnapshotJson(row: Formula): string {
  return JSON.stringify({
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    descricao: row.descricao,
    ativo_principal: row.ativo_principal,
    instrucoes: row.instrucoes,
    licenciada: row.licenciada,
    currencyCode: row.currencyCode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function integrityHash(parts: (string | null | undefined)[]): string {
  return createHash("sha256").update(parts.filter(Boolean).join("\u001e")).digest("hex");
}

function auditCreateData(input: {
  formulaId: string;
  action: FormulaAuditAction;
  actorSubject: string | null;
  requestId?: string | null;
  snapshotBefore: string | null;
  snapshotAfter: string | null;
}) {
  const rowIntegrity = integrityHash([
    input.action,
    input.formulaId,
    input.snapshotBefore ?? "",
    input.snapshotAfter ?? "",
    input.actorSubject ?? "",
  ]);
  return {
    formulaId: input.formulaId.slice(0, 128),
    action: input.action.slice(0, 32),
    actorSubject: input.actorSubject?.slice(0, 512) ?? null,
    requestId: input.requestId?.slice(0, 64) ?? null,
    snapshotBefore: input.snapshotBefore,
    snapshotAfter: input.snapshotAfter,
    rowIntegrity,
  };
}

/** Append-only dentro de uma transação Prisma (fórmula + auditoria atómicas). */
export async function appendFormulaAuditLogTx(
  tx: Prisma.TransactionClient,
  input: {
    formulaId: string;
    action: FormulaAuditAction;
    actorSubject: string | null;
    requestId?: string | null;
    snapshotBefore: string | null;
    snapshotAfter: string | null;
  },
): Promise<void> {
  await tx.formulaAuditLog.create({ data: auditCreateData(input) });
}

/**
 * Append-only: nunca atualizar nem apagar linhas de auditoria (imutabilidade / PI).
 */
export async function appendFormulaAuditLog(input: {
  formulaId: string;
  action: FormulaAuditAction;
  actorSubject: string | null;
  requestId?: string | null;
  snapshotBefore: string | null;
  snapshotAfter: string | null;
}): Promise<void> {
  await prisma.formulaAuditLog.create({ data: auditCreateData(input) });
}

export async function listFormulaAuditLogs(formulaId: string, take = 100) {
  return prisma.formulaAuditLog.findMany({
    where: { formulaId },
    orderBy: { createdAt: "desc" },
    take: Math.min(500, Math.max(1, take)),
  });
}
