/**
 * One-shot: encripta em BD campos sensíveis de fórmulas que ainda estão em texto claro.
 * Executar após definir CHEMVAULT_FORMULA_ENCRYPTION_KEY (ou usar derivação da sessão).
 *
 *   npx tsx scripts/backfill-formula-encryption.mts
 */
import { PrismaClient } from "@prisma/client";

import { encryptFormulaSensitiveFields } from "../lib/formula-field-crypto";

const prisma = new PrismaClient();

function needsEncrypt(s: string | null): boolean {
  if (s == null || s === "") return false;
  return !s.startsWith("cv1:");
}

async function main() {
  const rows = await prisma.formula.findMany();
  let n = 0;
  for (const r of rows) {
    const nextInstr = needsEncrypt(r.instrucoes) ? encryptFormulaSensitiveFields(r.instrucoes) : r.instrucoes;
    const nextDesc =
      r.descricao != null && needsEncrypt(r.descricao) ? encryptFormulaSensitiveFields(r.descricao) : r.descricao;
    const nextAtivo =
      r.ativo_principal != null && needsEncrypt(r.ativo_principal)
        ? encryptFormulaSensitiveFields(r.ativo_principal)
        : r.ativo_principal;
    if (nextInstr === r.instrucoes && nextDesc === r.descricao && nextAtivo === r.ativo_principal) continue;
    await prisma.formula.update({
      where: { id: r.id },
      data: { instrucoes: nextInstr ?? "", descricao: nextDesc, ativo_principal: nextAtivo },
    });
    n++;
  }
  console.log(JSON.stringify({ updatedRows: n, total: rows.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
