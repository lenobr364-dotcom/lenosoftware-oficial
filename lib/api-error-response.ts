import { NextResponse } from "next/server";

import { isLabVerboseErrors } from "@/lib/lab-env";
import { logRequestError, newRequestId } from "@/lib/server-logger";

export type ApiErrorBody = {
  ok: false;
  error: string;
  message: string;
  requestId: string;
  lab?: { code?: string; detail?: string };
};

export function jsonApiError(
  status: number,
  input: {
    error: string;
    message: string;
    scope: string;
    requestId?: string;
    cause?: unknown;
  },
): NextResponse<ApiErrorBody> {
  const requestId = input.requestId ?? newRequestId();
  if (input.cause !== undefined) {
    logRequestError(input.scope, requestId, input.cause, input.message);
  }
  const body: ApiErrorBody = {
    ok: false,
    error: input.error,
    message: input.message,
    requestId,
    ...(isLabVerboseErrors() && input.cause instanceof Error
      ? { lab: { code: input.error, detail: input.cause.message } }
      : {}),
  };
  return NextResponse.json(body, { status });
}
