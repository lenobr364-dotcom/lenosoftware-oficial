import { CurrencyCode } from "@prisma/client";
import { z } from "zod";

export const formulaAnalyzeBodySchema = z
  .object({
    formulaId: z.string().min(8).max(128),
  })
  .strict();

export const createFormulaBodySchema = z
  .object({
    nome: z.string().min(1).max(500),
    categoria: z.string().min(1).max(200),
    descricao: z.string().max(8000).nullable().optional(),
    ativo_principal: z.string().max(500).nullable().optional(),
    instrucoes: z.string().min(1).max(100_000),
    licenciada: z.boolean().optional(),
    currencyCode: z.nativeEnum(CurrencyCode).optional(),
  })
  .strict();

export const patchFormulaBodySchema = z
  .object({
    nome: z.string().min(1).max(500).optional(),
    categoria: z.string().min(1).max(200).optional(),
    descricao: z.string().max(8000).nullable().optional(),
    ativo_principal: z.string().max(500).nullable().optional(),
    instrucoes: z.string().min(1).max(100_000).optional(),
    licenciada: z.boolean().optional(),
    currencyCode: z.nativeEnum(CurrencyCode).optional(),
  })
  .strict();
