import { GoogleGenerativeAI } from "@google/generative-ai";

import type { FormulaLlmProvider } from "@/lib/formula-intelligence/providers/formula-llm-provider";
import type { FormulaAnalysisInput, FormulaAnalysisResult } from "@/lib/formula-intelligence/types";

const ANALYSIS_SCHEMA_HINT = `Return a single JSON object with keys:
- costOptimizations: array of { title: string, rationale: string, estimatedImpact: "low"|"medium"|"high" }
- substitutions: array of { componentOrRole: string, suggestedAlternative: string, rationale: string, confidence: number between 0 and 1 }
No markdown, no prose outside JSON.`;

export class GeminiFormulaAnalyzer implements FormulaLlmProvider {
  readonly id = "gemini";

  async analyze(input: FormulaAnalysisInput): Promise<FormulaAnalysisResult> {
    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.GOOGLE_AI_API_KEY?.trim();
    if (!apiKey) {
      return {
        provider: "unconfigured",
        costOptimizations: [],
        substitutions: [],
        notes: "Gemini API key not configured.",
      };
    }

    const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-pro";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const prompt = [
      "You are ChemVault's formulation economics assistant.",
      "Suggest realistic cost optimizations and possible raw-material substitutions.",
      "Respect safety and regulatory constraints; never recommend unapproved hazardous shortcuts.",
      ANALYSIS_SCHEMA_HINT,
      "Formula payload:",
      JSON.stringify(input),
    ].join("\n");

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const text = result.response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      return {
        provider: "gemini",
        model: modelId,
        costOptimizations: [],
        substitutions: [],
        notes: "Model returned non-JSON; check GEMINI_MODEL supports JSON mode.",
      };
    }

    const rec = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    const costOptimizations = Array.isArray(rec.costOptimizations) ? rec.costOptimizations : [];
    const substitutions = Array.isArray(rec.substitutions) ? rec.substitutions : [];

    return {
      provider: "gemini",
      model: modelId,
      costOptimizations: sanitizeCost(costOptimizations),
      substitutions: sanitizeSubs(substitutions),
    };
  }
}

function sanitizeCost(raw: unknown[]) {
  return raw
    .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : null))
    .filter(Boolean)
    .map((o) => ({
      title: String(o!.title ?? "").slice(0, 200),
      rationale: String(o!.rationale ?? "").slice(0, 2000),
      estimatedImpact: normalizeImpact(o!.estimatedImpact),
    }))
    .filter((x) => x.title.length > 0);
}

function sanitizeSubs(raw: unknown[]) {
  return raw
    .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : null))
    .filter(Boolean)
    .map((o) => ({
      componentOrRole: String(o!.componentOrRole ?? o!.from ?? "").slice(0, 200),
      suggestedAlternative: String(o!.suggestedAlternative ?? o!.to ?? "").slice(0, 500),
      rationale: String(o!.rationale ?? "").slice(0, 2000),
      confidence: Math.min(1, Math.max(0, Number(o!.confidence) || 0)),
    }))
    .filter((x) => x.componentOrRole.length > 0 && x.suggestedAlternative.length > 0);
}

function normalizeImpact(v: unknown): "low" | "medium" | "high" {
  const s = String(v ?? "").toLowerCase();
  if (s === "high" || s === "medium" || s === "low") return s;
  return "low";
}
