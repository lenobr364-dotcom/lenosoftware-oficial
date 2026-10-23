import type { FormulaAnalysisInput, FormulaAnalysisResult } from "@/lib/formula-intelligence/types";

export interface FormulaLlmProvider {
  readonly id: string;
  analyze(input: FormulaAnalysisInput): Promise<FormulaAnalysisResult>;
}
