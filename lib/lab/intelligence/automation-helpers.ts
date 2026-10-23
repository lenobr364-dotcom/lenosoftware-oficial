import { startProcess, updateProcess } from "@/lib/lab/intelligence/process-monitor";

export async function runProcessWithRoutine(routineId: string, label: string) {
  return startProcess({ routineId, label });
}

export async function completeProcessForRoutine(
  processId: string,
  success: boolean,
  message: string,
): Promise<void> {
  await updateProcess(processId, {
    status: success ? "completed" : "failed",
    progress: success ? 100 : undefined,
    logLine: message,
  });
}
