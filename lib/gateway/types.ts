export type ApiKeyStatus = "active" | "revoked";

export type ApiKeyScope =
  | "read:health"
  | "read:openapi"
  | "read:formulas"
  | "read:analytics"
  | "read:licensing";

export type ApiKeyRecord = {
  id: string;
  label: string;
  prefix: string;
  secretHash: string;
  subject: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  createdAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  requestCount: number;
};

export type ApiKeyPublicRow = {
  id: string;
  label: string;
  prefix: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  createdAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  requestCount: number;
};

export type ApiKeyCreateResult = {
  key: ApiKeyPublicRow;
  secret: string;
};

export type GatewayAccessLogEntry = {
  id: string;
  keyId: string;
  keyPrefix: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  at: string;
  ipHint: string;
};

export type GatewayDashboardPayload = {
  keys: ApiKeyPublicRow[];
  logs: GatewayAccessLogEntry[];
  stats: {
    activeKeys: number;
    revokedKeys: number;
    requests24h: number;
    avgLatencyMs: number;
  };
};

export type OpenApiPathMethod = {
  path: string;
  method: string;
  operation: Record<string, unknown>;
};
