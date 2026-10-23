import { z } from "zod";

const agentKindSchema = z.enum(["gemini", "cursor", "nexus-native", "custom"]);

export const registerAgentBodySchema = z
  .object({
    agentId: z.string().min(1).max(128).optional(),
    name: z.string().min(1).max(256),
    kind: agentKindSchema,
    capabilities: z.array(z.string().max(64)).max(32).optional(),
    webhookUrl: z.string().url().max(2048).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const agentHeartbeatBodySchema = z
  .object({
    agentId: z.string().min(1).max(128),
    status: z.enum(["online", "idle", "offline", "error"]).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const busPublishBodySchema = z
  .object({
    topic: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[a-z0-9][a-z0-9._-]*$/i, "topic must be lab-style identifier"),
    source: z.string().min(1).max(128),
    payload: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

export const automationRunBodySchema = z
  .object({
    routineId: z.string().min(1).max(64),
    force: z.boolean().optional(),
  })
  .strict();

export const rulesEvaluateBodySchema = z
  .object({
    context: z
      .object({
        totalFormulas: z.number().int().nonnegative().optional(),
        licensedFormulas: z.number().int().nonnegative().optional(),
        activeIndustrialLicenses: z.number().int().nonnegative().optional(),
        pendingLicenseRequests: z.number().int().nonnegative().optional(),
        impressionsToday: z.number().int().nonnegative().optional(),
        dbPingMs: z.number().nonnegative().optional(),
        licensedRatio: z.number().min(0).max(1).optional(),
        onlineAgents: z.number().int().nonnegative().optional(),
        staleAgents: z.number().int().nonnegative().optional(),
      })
      .optional(),
  })
  .strict();

export const aiInvokeBodySchema = z
  .object({
    action: z.enum(["ping", "decision_summary", "analyze_formula", "module_handoff"]),
    formulaId: z.string().min(1).max(128).optional(),
    prompt: z.string().max(16_384).optional(),
    handoff: z
      .object({
        targetModule: z.string().max(64),
        intent: z.string().max(512),
        payload: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
  })
  .strict();
