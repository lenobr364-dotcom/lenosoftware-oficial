import { listAccessLogs, computeLogStats } from "@/lib/gateway/access-log-store";
import { listApiKeysForSubject } from "@/lib/gateway/api-key-store";
import type { GatewayDashboardPayload } from "@/lib/gateway/types";

export async function getGatewayDashboard(subject: string): Promise<GatewayDashboardPayload> {
  const keys = await listApiKeysForSubject(subject);
  const keyIds = keys.map((k) => k.id);
  const logs = await listAccessLogs({ subjectKeyIds: keyIds, limit: 100 });
  const stats = computeLogStats(logs);
  const activeKeys = keys.filter((k) => k.status === "active").length;
  const revokedKeys = keys.filter((k) => k.status === "revoked").length;

  return {
    keys,
    logs,
    stats: {
      activeKeys,
      revokedKeys,
      requests24h: stats.requests24h,
      avgLatencyMs: stats.avgLatencyMs,
    },
  };
}
