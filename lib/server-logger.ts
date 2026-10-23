import { isLabVerboseErrors } from "@/lib/lab-env";

export type LogLevel = "error" | "warn" | "info" | "debug";

export type LabLogRecord = {
  level: LogLevel;
  scope: string;
  requestId?: string;
  message: string;
  /** Present when LAB_VERBOSE_ERRORS=1 or non-production */
  detail?: string;
  stack?: string;
};

export function logLab(record: LabLogRecord): void {
  if (record.level === "info" || record.level === "debug") {
    if (process.env.NODE_ENV === "production" && !isLabVerboseErrors()) return;
  }
  const line = {
    ts: new Date().toISOString(),
    ...record,
  };
  if (record.level === "error" || record.level === "warn") {
    console.error(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

export function logRequestError(scope: string, requestId: string, err: unknown, message: string): void {
  const e = err instanceof Error ? err : new Error(String(err));
  logLab({
    level: "error",
    scope,
    requestId,
    message,
    ...(isLabVerboseErrors() ? { detail: e.message, stack: e.stack } : {}),
  });
}

export function newRequestId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
