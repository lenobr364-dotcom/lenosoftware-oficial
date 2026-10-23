import type { Formula } from "@prisma/client";

import { decryptFormulaRow } from "@/lib/formula-field-crypto";
import type { FormulaGlassCardData } from "@/lib/formula-glass-card-data";
import { parseFormulaInstrucoesBlocks } from "@/lib/formula-instrucoes-blocks";
import { parseProductLine } from "@/lib/product-line";

export function prismaFormulaToGlassCardData(row: Formula): FormulaGlassCardData {
  const plain = decryptFormulaRow(row);
  const b = parseFormulaInstrucoesBlocks(plain.instrucoes);
  return {
    id: plain.id,
    title: plain.nome,
    productLine: parseProductLine(plain.categoria, plain.nome),
    rawMaterials: b.RAW ?? "",
    preparationMethod: b.PREP ?? "",
    dilutionDetails: b.DIL ?? "",
    chemicalEquivalence: b.EQUIV ?? "",
    technicalDossier: b.DOSSIER ?? "",
    hardwareIntegrationProfile: b.HW ?? "",
    licensingTags: b.TAGS ?? "",
    stewardAuthor: plain.licenciada ? "Leno César" : "",
  };
}
