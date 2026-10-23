/**
 * Tipos da camada de inteligência do laboratório NEXUS.
 */

export type AgentKind = "gemini" | "cursor" | "nexus-native" | "custom";

export type AgentStatus = "online" | "idle" | "offline" | "error";

export type ProcessStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type RuleSeverity = "info" | "warning" | "critical";

export type RuleDecision = "allow" | "deny" | "escalate" | "notify";

export type RegisteredAgent = {
  id: string;
  name: string;
  kind: AgentKind;
  capabilities: string[];
  webhookUrl?: string;
  status: AgentStatus;
  registeredAt: string;
  lastHeartbeatAt: string | null;
  metadata?: Record<string, unknown>;
};

export type LabProcess = {
  id: string;
  routineId: string;
  label: string;
  status: ProcessStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  progress: number;
  logs: string[];
  metadata?: Record<string, unknown>;
};

export type BusEvent = {
  id: string;
  topic: string;
  source: string;
  payload: Record<string, unknown>;
  at: string;
};

export type AutomationRunRecord = {
  id: string;
  routineId: string;
  startedAt: string;
  completedAt: string;
  success: boolean;
  summary: string;
  decisionsCount: number;
};

export type LabIntelligencePersistedState = {
  version: 1;
  agents: Record<string, RegisteredAgent>;
  processes: LabProcess[];
  busEvents: BusEvent[];
  automationRuns: AutomationRunRecord[];
  lastTickAt: string | null;
};

export type RuleCondition =
  | { op: "eq"; path: string; value: unknown }
  | { op: "gt" | "gte" | "lt" | "lte"; path: string; value: number }
  | { op: "in"; path: string; values: unknown[] }
  | { op: "and"; conditions: RuleCondition[] }
  | { op: "or"; conditions: RuleCondition[] }
  | { op: "not"; condition: RuleCondition };

export type IntelligenceRule = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: RuleSeverity;
  condition: RuleCondition;
  decision: RuleDecision;
  action: "emit_bus" | "start_process" | "notify_only";
  busTopic?: string;
  processLabel?: string;
};

export type RuleEvaluationResult = {
  ruleId: string;
  matched: boolean;
  decision: RuleDecision;
  severity: RuleSeverity;
  message: string;
  action: IntelligenceRule["action"];
  busTopic?: string;
};

export type LabRuleContext = {
  timestamp: string;
  totalFormulas: number;
  licensedFormulas: number;
  activeIndustrialLicenses: number;
  pendingLicenseRequests: number;
  impressionsToday: number;
  dbPingMs: number;
  licensedRatio: number;
  onlineAgents: number;
  staleAgents: number;
};

export type AutomationRoutine = {
  id: string;
  name: string;
  description: string;
  intervalMinutes: number;
  enabled: boolean;
  tags: string[];
};

export type IntelligenceStatusPayload = {
  operational: boolean;
  lastTickAt: string | null;
  agents: {
    total: number;
    online: number;
    offline: number;
  };
  processes: {
    active: number;
    recent: LabProcess[];
  };
  bus: {
    eventCount: number;
    recentTopics: string[];
  };
  automation: {
    routines: AutomationRoutine[];
    lastRuns: AutomationRunRecord[];
  };
  rules: {
    catalogSize: number;
    lastEvaluationCount: number;
  };
};
