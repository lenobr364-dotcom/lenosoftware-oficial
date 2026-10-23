export type GcpLinkStatus =
  | { status: "disconnected"; headline: string; detail: string; projectId: null; region: null }
  | { status: "configured"; headline: string; detail: string; projectId: string; region: string | null };

export function readGcpLinkStatus(): GcpLinkStatus {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const region = process.env.GOOGLE_CLOUD_REGION?.trim();

  if (!projectId) {
    return {
      status: "disconnected",
      headline: "Google Cloud not configured",
      detail:
        "Set GOOGLE_CLOUD_PROJECT (and optional GOOGLE_CLOUD_REGION). For NLP support, plan Vertex AI / Gemini (see .env.example).",
      projectId: null,
      region: null,
    };
  }

  return {
    status: "configured",
    headline: "Project linked (runtime checks pending)",
    detail: "Wire ADC or workload identity for live health probes.",
    projectId,
    region: region ?? null,
  };
}
