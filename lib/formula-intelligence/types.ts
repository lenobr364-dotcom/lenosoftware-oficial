export type CostImpactLevel = "low" | "medium" | "high";

export type CostOptimizationSuggestion = {
  title: string;
  rationale: string;
  estimatedImpact: CostImpactLevel;
};

export type SubstitutionSuggestion = {
  componentOrRole: string;
  suggestedAlternative: string;
  rationale: string;
  confidence: number;
};

export type FormulaAnalysisResult = {
  provider: "gemini" | "stub" | "unconfigured";
  model?: string;
  costOptimizations: CostOptimizationSuggestion[];
  substitutions: SubstitutionSuggestion[];
  notes?: string;
};

export type FormulaAnalysisInput = {
  id: string;
  nome: string;
  categoria: string;
  descricao: string | null;
  ativo_principal: string | null;
  instrucoes: string;
  licenciada: boolean;
  currencyCode: string;
};
