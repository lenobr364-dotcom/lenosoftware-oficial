import type { ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  ceoAuthBodySchema,
  clientAccessBodySchema,
  internalSecurityEventBodySchema,
  portalAuthBodySchema,
  requestLicenseBodySchema,
  vaultUnlockBodySchema,
} from "@/lib/validation/api-schemas";
import { createIndustrialFormulaBodySchema } from "@/lib/validation/industrial-formula-schemas";

function schema(name: string, zodSchema: ZodType) {
  return zodToJsonSchema(zodSchema as never, {
    name,
    target: "openApi3",
    $refStrategy: "none",
  }) as Record<string, unknown>;
}

export function buildOpenApiDocument(): Record<string, unknown> {
  return {
    openapi: "3.0.3",
    info: {
      title: "ChemVault Global API",
      version: "0.1.0",
      description:
        "HTTP surface for licensing, vault, telemetry, and operations. Webhooks (optional): set CHEMVAULT_WEBHOOK_URLS + CHEMVAULT_WEBHOOK_SECRET.",
    },
    servers: [{ url: "/", description: "Same origin as the Next.js app" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "ChemVault integration key (cvk_live_<id>.<secret>). Mint and revoke keys in the dashboard under API Integration & Gateway.",
        },
        CeoCoreSession: {
          type: "apiKey",
          in: "cookie",
          name: "chemvault_ceo_session",
          description: "CEO session + core license cookies (browser dashboard).",
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          summary: "Health probe",
          responses: {
            "200": { description: "Service reachable" },
          },
        },
      },
      "/api/openapi.json": {
        get: {
          summary: "OpenAPI 3 document (this specification)",
          responses: {
            "200": {
              description: "JSON document",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/auth": {
        post: {
          summary: "Portal license authentication",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schema("PortalAuthBody", portalAuthBodySchema),
              },
            },
          },
          responses: {
            "200": {
              description: "authorized true/false; cookies set when authorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      authorized: { type: "boolean" },
                      reason: { type: "string", enum: ["suspended", "geo_policy"] },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid JSON or validation error" },
          },
        },
      },
      "/api/auth/ceo": {
        post: {
          summary: "CEO dashboard authentication",
          requestBody: {
            required: true,
            content: { "application/json": { schema: schema("CeoAuthBody", ceoAuthBodySchema) } },
          },
          responses: {
            "200": { description: "ok true + session cookies" },
            "400": { description: "Validation error" },
            "401": { description: "Invalid credentials" },
            "503": { description: "Admin not configured" },
          },
        },
      },
      "/api/vault/unlock": {
        post: {
          summary: "Unlock landing vault (gate cookie + core license)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: schema("VaultUnlockBody", vaultUnlockBodySchema) } },
          },
          responses: {
            "200": { description: "ok true" },
            "400": { description: "Validation error" },
            "401": { description: "Invalid access key" },
          },
        },
      },
      "/api/formulas": {
        get: {
          summary: "Public formula catalog (cached) — requires valid core license session cookie",
          responses: {
            "200": { description: "Array of formulas (sensitive fields decrypted by the app for authorized sessions)" },
            "401": { description: "Missing or expired core license session (core_license_required)" },
          },
        },
      },
      "/api/industrial-formulas": {
        get: {
          summary: "Structured industrial formulas with typed BOM (ingredients)",
          responses: {
            "200": { description: "{ ok: true, formulas: [...] }" },
          },
        },
        post: {
          summary: "Register structured industrial formula (CEO + core license)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schema("CreateIndustrialFormulaBody", createIndustrialFormulaBodySchema),
              },
            },
          },
          responses: {
            "201": { description: "{ ok: true, formula }" },
            "400": { description: "validation_error" },
            "401": { description: "Unauthorized" },
            "409": { description: "id_formula_already_exists" },
          },
        },
      },
      "/api/industrial-formulas/{idFormula}": {
        get: {
          summary: "Single industrial formula by business code (ex.: CHM-IND-001)",
          parameters: [
            {
              name: "idFormula",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "{ ok: true, formula }" },
            "401": { description: "Unauthorized" },
            "404": { description: "industrial_formula_not_found" },
          },
        },
      },
      "/api/vault/formulas": {
        get: {
          summary: "Vault formulas (masked) — requires vault gate cookie",
          responses: {
            "200": { description: "{ formulas: [...] }" },
            "401": { description: "vault_locked" },
          },
        },
      },
      "/api/client-access": {
        post: {
          summary: "Mint client access token for a formula",
          requestBody: {
            required: true,
            content: { "application/json": { schema: schema("ClientAccessBody", clientAccessBodySchema) } },
          },
          responses: {
            "200": { description: "{ token }" },
            "400": { description: "Invalid formula or validation" },
            "401": { description: "Session required" },
          },
        },
      },
      "/api/request-license": {
        post: {
          summary: "Submit B2B license request",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: schema("RequestLicenseBody", requestLicenseBodySchema) },
            },
          },
          responses: {
            "200": { description: "{ ok: true, requestId }" },
            "400": { description: "Validation or business rule rejection" },
            "500": { description: "Persistence error" },
          },
        },
      },
      "/api/internal/security-event": {
        post: {
          summary: "Internal security log (middleware / trusted callers)",
          parameters: [
            {
              name: "x-chemvault-internal",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Must match CHEMVAULT_INTERNAL_LOG_SECRET",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: schema("InternalSecurityEventBody", internalSecurityEventBodySchema),
              },
            },
          },
          responses: {
            "200": { description: "{ ok: true }" },
            "400": { description: "Bad payload" },
            "404": { description: "Invalid secret (masked)" },
          },
        },
      },
      "/api/licensing/formula-industrial/fingerprint": {
        get: {
          summary: "Industrial formula SHA-256 fingerprints (CEO + core license)",
          responses: {
            "200": { description: "{ ok, formulas: [...] }" },
            "401": { description: "ceo_session_required | core_license_required" },
          },
        },
      },
      "/api/licensing/formula-industrial/grant": {
        post: {
          summary: "Mint per-client formula license (simulated smart contract; persisted)",
          responses: {
            "200": { description: "{ ok, grantHash, chainAnchor }" },
            "400": { description: "validation_error" },
            "401": { description: "Unauthorized" },
            "404": { description: "unknown_formula_code" },
          },
        },
      },
      "/api/agents/formula-licenses/audit": {
        get: {
          summary: "Autonomous agent audit — fingerprints + license grants",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: { type: "string" },
              description: "Bearer CHEMVAULT_FORMULA_AGENT_SECRET",
            },
          ],
          responses: {
            "200": { description: "{ ok, fingerprints, grants }" },
            "401": { description: "formula_agent_unauthorized" },
            "503": { description: "formula_agent_not_configured" },
          },
        },
      },
      "/api/nexus/lab/intelligence/status": {
        get: {
          summary: "NEXUS lab intelligence snapshot (agents, bus, automation)",
          description:
            "CEO session + core license cookie, or Bearer CHEMVAULT_LAB_AGENT_SECRET when configured.",
          responses: {
            "200": { description: "{ ok, data }" },
            "401": { description: "ceo_session_required | lab_agent_unauthorized" },
          },
        },
      },
      "/api/nexus/lab/intelligence/agents/register": {
        post: {
          summary: "Register autonomous digital agent",
          responses: {
            "201": { description: "{ ok, agent }" },
            "400": { description: "validation_error" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/nexus/lab/intelligence/agents/heartbeat": {
        post: {
          summary: "Agent heartbeat",
          responses: {
            "200": { description: "{ ok, agent }" },
            "404": { description: "agent_not_found" },
          },
        },
      },
      "/api/nexus/lab/intelligence/automation/run": {
        post: {
          summary: "Run a background automation routine by id",
          responses: {
            "200": { description: "{ ok, routine, run }" },
            "404": { description: "routine_not_found" },
          },
        },
      },
      "/api/nexus/lab/intelligence/automation/tick": {
        post: {
          summary: "Cron tick — run due automation routines",
          description: "Bearer CHEMVAULT_LAB_AGENT_SECRET only.",
          responses: {
            "200": { description: "{ ok, ran, skipped }" },
            "503": { description: "lab_agent_not_configured" },
          },
        },
      },
      "/api/nexus/lab/intelligence/bus/publish": {
        post: {
          summary: "Publish inter-module bus event",
          responses: { "201": { description: "{ ok, event }" } },
        },
      },
      "/api/nexus/lab/intelligence/bus/events": {
        get: {
          summary: "List bus events (topic, since, limit)",
          responses: { "200": { description: "{ ok, events }" } },
        },
      },
      "/api/nexus/lab/intelligence/rules/evaluate": {
        post: {
          summary: "Evaluate predefined intelligence rules",
          responses: { "200": { description: "{ ok, context, results }" } },
        },
      },
      "/api/nexus/lab/intelligence/ai/invoke": {
        post: {
          summary: "AI bridge — ping, decision_summary, analyze_formula, module_handoff",
          responses: {
            "200": { description: "{ ok, result }" },
            "400": { description: "formula_not_found | validation_error" },
          },
        },
      },
      "/api/gateway/v1/ping": {
        get: {
          summary: "Gateway ping (API key)",
          description: "Low-latency probe for integrators. Requires Bearer cvk_live_* key with read:health scope.",
          security: [{ ApiKeyAuth: [] }],
          responses: {
            "200": { description: "{ ok, service, keyPrefix, latencyMs }" },
            "401": { description: "gateway_api_key_required" },
            "403": { description: "insufficient_scope" },
            "429": { description: "rate_limited" },
          },
        },
      },
      "/api/dashboard/gateway": {
        get: {
          summary: "Gateway dashboard — keys, access logs, stats",
          security: [{ CeoCoreSession: [] }],
          responses: {
            "200": { description: "{ ok, data: { keys, logs, stats } }" },
            "401": { description: "ceo_session_required | core_license_required" },
          },
        },
      },
      "/api/dashboard/gateway/keys": {
        get: {
          summary: "List API keys for the licensed subject",
          security: [{ CeoCoreSession: [] }],
          responses: { "200": { description: "{ ok, keys }" } },
        },
        post: {
          summary: "Mint a new high-performance API key (secret shown once)",
          security: [{ CeoCoreSession: [] }],
          responses: {
            "200": { description: "{ ok, key, secret }" },
            "409": { description: "active_key_limit" },
          },
        },
      },
      "/api/dashboard/gateway/keys/revoke": {
        post: {
          summary: "Revoke an API key",
          security: [{ CeoCoreSession: [] }],
          responses: {
            "200": { description: "{ ok, key }" },
            "404": { description: "key_not_found" },
          },
        },
      },
    },
  };
}
