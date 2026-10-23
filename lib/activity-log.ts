export const ACTIVITY_LOG_STORAGE_KEY = "chemvault-activity-logs-v1";
export const ACTIVITY_LOG_EVENT = "chemvault-activity-log-updated";

export const MAX_ACTIVITY_LOGS = 80;

export type ActivityLogEntry = {
  id: string;
  at: string;
  formulaId: string;
  formulaName: string;
  /** Ex.: Admin — apresentado como [Admin] na UI */
  actorRole: string;
};

function safeParse(raw: string | null): ActivityLogEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is ActivityLogEntry =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as ActivityLogEntry).id === "string" &&
        typeof (row as ActivityLogEntry).at === "string" &&
        typeof (row as ActivityLogEntry).formulaId === "string" &&
        typeof (row as ActivityLogEntry).formulaName === "string" &&
        typeof (row as ActivityLogEntry).actorRole === "string",
    );
  } catch {
    return [];
  }
}

export function readActivityLogs(): ActivityLogEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY));
}

export function appendFormulaViewLog(
  formulaId: string,
  formulaName: string,
  actorRole: string = "Admin",
): void {
  if (typeof window === "undefined") return;
  const entry: ActivityLogEntry = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    formulaId,
    formulaName,
    actorRole,
  };
  const prev = readActivityLogs();
  const next = [entry, ...prev].slice(0, MAX_ACTIVITY_LOGS);
  localStorage.setItem(ACTIVITY_LOG_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ACTIVITY_LOG_EVENT));
}
