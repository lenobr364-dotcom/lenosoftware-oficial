import type { CurrencyCode, Prisma } from "@prisma/client";

import { appendFormulaAuditLogTx, formulaToSnapshotJson } from "@/lib/formula-audit";
import {
  decryptFormulaRow,
  encryptFormulaCreateData,
  encryptFormulaPatchData,
} from "@/lib/formula-field-crypto";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export type CreateFormulaInput = {
  nome: string;
  categoria: string;
  descricao?: string | null;
  ativo_principal?: string | null;
  instrucoes: string;
  licenciada?: boolean;
  currencyCode?: CurrencyCode;
};

export type PatchFormulaInput = Partial<{
  nome: string;
  categoria: string;
  descricao: string | null;
  ativo_principal: string | null;
  instrucoes: string;
  licenciada: boolean;
  currencyCode: CurrencyCode;
}>;

function bumpCatalogCache() {
  try {
    revalidateTag("formulas", "default");
  } catch {
    /* ignore outside Next request context */
  }
}

export async function createFormulaAudited(
  actorSubject: string | null,
  input: CreateFormulaInput,
  requestId?: string | null,
) {
  const row = await prisma.$transaction(async (tx) => {
    const data = encryptFormulaCreateData({
      nome: input.nome,
      categoria: input.categoria,
      descricao: input.descricao ?? null,
      ativo_principal: input.ativo_principal ?? null,
      instrucoes: input.instrucoes,
      licenciada: input.licenciada ?? false,
      currencyCode: input.currencyCode ?? "BRL",
    });
    const created = await tx.formula.create({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        descricao: data.descricao,
        ativo_principal: data.ativo_principal,
        instrucoes: data.instrucoes,
        licenciada: data.licenciada ?? false,
        currencyCode: data.currencyCode ?? "BRL",
      },
    });
    await appendFormulaAuditLogTx(tx, {
      formulaId: created.id,
      action: "CREATE",
      actorSubject,
      requestId,
      snapshotBefore: null,
      snapshotAfter: formulaToSnapshotJson(decryptFormulaRow(created)),
    });
    return decryptFormulaRow(created);
  });
  bumpCatalogCache();
  return row;
}

export async function updateFormulaAudited(
  actorSubject: string | null,
  formulaId: string,
  patch: PatchFormulaInput,
  requestId?: string | null,
) {
  const row = await prisma.$transaction(async (tx) => {
    const beforeEnc = await tx.formula.findUnique({ where: { id: formulaId } });
    if (!beforeEnc) return null;
    const beforePlain = decryptFormulaRow(beforeEnc);
    const encPatch = encryptFormulaPatchData(patch);
    const data: Prisma.FormulaUpdateInput = {};
    if (encPatch.nome !== undefined) data.nome = encPatch.nome;
    if (encPatch.categoria !== undefined) data.categoria = encPatch.categoria;
    if (encPatch.descricao !== undefined) data.descricao = encPatch.descricao;
    if (encPatch.ativo_principal !== undefined) data.ativo_principal = encPatch.ativo_principal;
    if (encPatch.instrucoes !== undefined) data.instrucoes = encPatch.instrucoes;
    if (encPatch.licenciada !== undefined) data.licenciada = encPatch.licenciada;
    if (encPatch.currencyCode !== undefined) data.currencyCode = encPatch.currencyCode;
    const updated = await tx.formula.update({
      where: { id: formulaId },
      data,
    });
    await appendFormulaAuditLogTx(tx, {
      formulaId,
      action: "UPDATE",
      actorSubject,
      requestId,
      snapshotBefore: formulaToSnapshotJson(beforePlain),
      snapshotAfter: formulaToSnapshotJson(decryptFormulaRow(updated)),
    });
    return decryptFormulaRow(updated);
  });
  if (row) bumpCatalogCache();
  return row;
}

export async function deleteFormulaAudited(
  actorSubject: string | null,
  formulaId: string,
  requestId?: string | null,
) {
  const ok = await prisma.$transaction(async (tx) => {
    const beforeEnc = await tx.formula.findUnique({ where: { id: formulaId } });
    if (!beforeEnc) return false;
    const beforePlain = decryptFormulaRow(beforeEnc);
    await appendFormulaAuditLogTx(tx, {
      formulaId,
      action: "DELETE",
      actorSubject,
      requestId,
      snapshotBefore: formulaToSnapshotJson(beforePlain),
      snapshotAfter: null,
    });
    await tx.formula.delete({ where: { id: formulaId } });
    return true;
  });
  if (ok) bumpCatalogCache();
  return ok;
}
