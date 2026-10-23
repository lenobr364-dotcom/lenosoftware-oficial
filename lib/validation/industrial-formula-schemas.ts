import { z } from "zod";

export const ingredienteSchema = z
  .object({
    nome_tecnico: z.string().min(1).max(500),
    concentracao_percentual: z.number().min(0).max(100),
    custo_por_kg_dolar: z.number().nonnegative(),
    funcao_quimica: z.string().min(1).max(200),
  })
  .strict();

export const createIndustrialFormulaBodySchema = z
  .object({
    id_formula: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[A-Z0-9-]+$/u, "id_formula must use uppercase letters, digits, and hyphens"),
    nome_comercial: z.string().min(1).max(500),
    aplicacao: z.string().min(1).max(500),
    ingredientes: z.array(ingredienteSchema).min(1).max(100),
    ph_ideal: z.number().min(0).max(14),
    margem_lucro_estimada_percentual: z.number(),
    instrucoes_seguranca: z.string().min(1).max(10_000),
    licenciada: z.boolean().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const total = val.ingredientes.reduce((sum, ing) => sum + ing.concentracao_percentual, 0);
    if (total > 100.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sum of concentracao_percentual must not exceed 100%.",
        path: ["ingredientes"],
      });
    }
  });

export type CreateIndustrialFormulaBody = z.infer<typeof createIndustrialFormulaBodySchema>;
export type IngredienteBody = z.infer<typeof ingredienteSchema>;
