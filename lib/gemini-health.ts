import { GoogleGenerativeAI } from "@google/generative-ai";

export type GeminiLinkStatus =
  | { kind: "unconfigured"; detail: string }
  | { kind: "ok"; model: string; latencyMs: number }
  | { kind: "error"; detail: string };

/**
 * Live probe against Google AI Studio (API key). Vertex AI / ADC is not exercised here.
 * Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY and optional GEMINI_MODEL (default: gemini-1.5-pro).
 */
export async function readGeminiLinkStatus(): Promise<GeminiLinkStatus> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();

  if (!apiKey) {
    return {
      kind: "unconfigured",
      detail:
        "Add GEMINI_API_KEY from Google AI Studio to .env.local to verify Gemini connectivity.",
    };
  }

  const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-pro";
  const started = Date.now();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Reply with exactly: PONG" }] }],
      generationConfig: { maxOutputTokens: 24, temperature: 0 },
    });
    const text = result.response.text()?.trim();
    if (!text) {
      return { kind: "error", detail: "Empty response from Gemini." };
    }
    return { kind: "ok", model: modelId, latencyMs: Date.now() - started };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { kind: "error", detail: msg };
  }
}
