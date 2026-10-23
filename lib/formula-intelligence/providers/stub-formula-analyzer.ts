import type { FormulaLlmProvider } from "@/lib/formula-intelligence/providers/formula-llm-provider";
import type { FormulaAnalysisInput, FormulaAnalysisResult } from "@/lib/formula-intelligence/types";

/** Heurística local quando não há chave LLM — mantém UX e testes sem rede. */
export class StubFormulaAnalyzer implements FormulaLlmProvider {
  readonly id = "stub";

  async analyze(input: FormulaAnalysisInput): Promise<FormulaAnalysisResult> {
    const costOptimizations = [];
    const substitutions = [];

    const cat = input.categoria.toLowerCase();
    if (cat.includes("industrial") || cat.includes("indústria")) {
      costOptimizations.push({
        title: "Volume de matéria-prima",
        rationale:
          "Categorias industriais costumam beneficiar de contratos anuais com fornecedores homologados; negociar tier de preço por volume.",
        estimatedImpact: "medium" as const,
      });
    }

    if (input.ativo_principal?.trim()) {
      substitutions.push({
        componentOrRole: "Ativo principal declarado",
        suggestedAlternative: "Avaliar grau técnico vs. grau alimentar conforme aplicação final (compliance regulatório).",
        rationale: "Diferentes graus alteram custo e documentação de exportação.",
        confidence: 0.35,
      });
    }

    return {
      provider: "stub",
      costOptimizations,
      substitutions,
      notes: "Motor stub: configure GEMINI_API_KEY ou OPENAI_API_KEY + FORMULA_INTEL_PROVIDER para análise LLM.",
    };
  }
}
