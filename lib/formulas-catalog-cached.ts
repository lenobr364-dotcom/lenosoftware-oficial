import { unstable_cache } from "next/cache";

import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import { prisma } from "@/lib/prisma";

const getFormulasCached = unstable_cache(
  async () =>
    prisma.formula.findMany({
      orderBy: { nome: "asc" },
    }),
  ["chemvault-formulas-catalog-v1"],
  { revalidate: 120, tags: ["formulas"] },
);

/** Catálogo de fórmulas com cache ISR (Next) — dados sensíveis desencriptados só na saída. */
export async function getFormulasCatalogCached() {
  const rows = await getFormulasCached();
  return rows.map(decryptFormulaRow);
}
