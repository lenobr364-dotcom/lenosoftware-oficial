import type { Ingredient, IndustrialFormula, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  CreateIndustrialFormulaBody,
  IngredienteBody,
} from "@/lib/validation/industrial-formula-schemas";

export type CreateIndustrialFormulaInput = CreateIndustrialFormulaBody;

export type IndustrialFormulaWithIngredients = IndustrialFormula & {
  ingredientes: Ingredient[];
};

export type SerializedIndustrialFormula = {
  id: string;
  id_formula: string;
  nome_comercial: string;
  aplicacao: string;
  ph_ideal: number;
  margem_lucro_estimada_percentual: number;
  instrucoes_seguranca: string;
  licenciada: boolean;
  ingredientes: IngredienteBody[];
  created_at: string;
  updated_at: string;
};

function mapIngredientRow(ing: Ingredient): IngredienteBody {
  return {
    nome_tecnico: ing.nomeTecnico,
    concentracao_percentual: ing.concentracaoPercentual,
    custo_por_kg_dolar: ing.custoPorKgDolar,
    funcao_quimica: ing.funcaoQuimica,
  };
}

export function serializeIndustrialFormula(row: IndustrialFormulaWithIngredients): SerializedIndustrialFormula {
  return {
    id: row.id,
    id_formula: row.idFormula,
    nome_comercial: row.nomeComercial,
    aplicacao: row.aplicacao,
    ph_ideal: row.phIdeal,
    margem_lucro_estimada_percentual: row.margemLucroEstimadaPercentual,
    instrucoes_seguranca: row.instrucoesSeguranca,
    licenciada: row.licenciada,
    ingredientes: row.ingredientes
      .slice()
      .sort((a, b) => a.ordem - b.ordem || a.nomeTecnico.localeCompare(b.nomeTecnico))
      .map(mapIngredientRow),
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

function toCreateData(input: CreateIndustrialFormulaInput): Prisma.IndustrialFormulaCreateInput {
  return {
    idFormula: input.id_formula,
    nomeComercial: input.nome_comercial,
    aplicacao: input.aplicacao,
    phIdeal: input.ph_ideal,
    margemLucroEstimadaPercentual: input.margem_lucro_estimada_percentual,
    instrucoesSeguranca: input.instrucoes_seguranca,
    licenciada: input.licenciada ?? false,
    ingredientes: {
      create: input.ingredientes.map((ing, ordem) => ({
        nomeTecnico: ing.nome_tecnico,
        concentracaoPercentual: ing.concentracao_percentual,
        custoPorKgDolar: ing.custo_por_kg_dolar,
        funcaoQuimica: ing.funcao_quimica,
        ordem,
      })),
    },
  };
}

const includeIngredients = { ingredientes: { orderBy: { ordem: "asc" as const } } };

export async function listIndustrialFormulas(): Promise<SerializedIndustrialFormula[]> {
  const rows = await prisma.industrialFormula.findMany({
    include: includeIngredients,
    orderBy: { idFormula: "asc" },
  });
  return rows.map(serializeIndustrialFormula);
}

export async function getIndustrialFormulaByCode(
  idFormula: string,
): Promise<SerializedIndustrialFormula | null> {
  const row = await prisma.industrialFormula.findUnique({
    where: { idFormula },
    include: includeIngredients,
  });
  return row ? serializeIndustrialFormula(row) : null;
}

export async function createIndustrialFormula(
  input: CreateIndustrialFormulaInput,
): Promise<SerializedIndustrialFormula> {
  const row = await prisma.industrialFormula.create({
    data: toCreateData(input),
    include: includeIngredients,
  });
  return serializeIndustrialFormula(row);
}

export async function upsertIndustrialFormula(
  input: CreateIndustrialFormulaInput,
): Promise<SerializedIndustrialFormula> {
  const existing = await prisma.industrialFormula.findUnique({
    where: { idFormula: input.id_formula },
    select: { id: true },
  });

  if (!existing) {
    return createIndustrialFormula(input);
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { industrialFormulaId: existing.id } });
    return tx.industrialFormula.update({
      where: { id: existing.id },
      data: {
        nomeComercial: input.nome_comercial,
        aplicacao: input.aplicacao,
        phIdeal: input.ph_ideal,
        margemLucroEstimadaPercentual: input.margem_lucro_estimada_percentual,
        instrucoesSeguranca: input.instrucoes_seguranca,
        licenciada: input.licenciada ?? false,
        ingredientes: {
          create: input.ingredientes.map((ing, ordem) => ({
            nomeTecnico: ing.nome_tecnico,
            concentracaoPercentual: ing.concentracao_percentual,
            custoPorKgDolar: ing.custo_por_kg_dolar,
            funcaoQuimica: ing.funcao_quimica,
            ordem,
          })),
        },
      },
      include: includeIngredients,
    });
  });

  return serializeIndustrialFormula(row);
}

export async function resolveIndustrialFormulaCode(idFormula: string): Promise<{ id: string; idFormula: string } | null> {
  const row = await prisma.industrialFormula.findUnique({
    where: { idFormula },
    select: { id: true, idFormula: true },
  });
  return row;
}
