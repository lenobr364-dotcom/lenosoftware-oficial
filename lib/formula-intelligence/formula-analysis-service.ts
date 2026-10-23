import type { Formula } from "@prisma/client";

import { GeminiFormulaAnalyzer } from "@/lib/formula-intelligence/providers/gemini-formula-analyzer";
import type { FormulaLlmProvider } from "@/lib/formula-intelligence/providers/formula-llm-provider";
import { StubFormulaAnalyzer } from "@/lib/formula-intelligence/providers/stub-formula-analyzer";
import type { FormulaAnalysisInput, FormulaAnalysisResult } from "@/lib/formula-intelligence/types";

function rowToInput(row: Formula): FormulaAnalysisInput {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    descricao: row.descricao,
    ativo_principal: row.ativo_principal,
    instrucoes: row.instrucoes,
    licenciada: row.licenciada,
    currencyCode: row.currencyCode,
  };
}

function resolveProvider(): FormulaLlmProvider {
  const mode = process.env.FORMULA_INTEL_PROVIDER?.trim().toLowerCase() || "auto";
  const hasGemini =
    Boolean(process.env.GEMINI_API_KEY?.trim()) ||
    Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) ||
    Boolean(process.env.GOOGLE_AI_API_KEY?.trim());

  if (mode === "gemini" || (mode === "auto" && hasGemini)) {
    return new GeminiFormulaAnalyzer();
  }

  if (mode === "openai") {
    // Extensão futura: OpenAI GPT-4 — manter interface FormulaLlmProvider.
    return new StubFormulaAnalyzer();
  }

  return new StubFormulaAnalyzer();
}

/**
 * Motor de inteligência de fórmulas: orquestra providers LLM (Gemini hoje; GPT-4 via mesma interface).
 */
export async function analyzeFormulaRow(row: Formula): Promise<FormulaAnalysisResult> {
  const provider = resolveProvider();
  return provider.analyze(rowToInput(row));
}
