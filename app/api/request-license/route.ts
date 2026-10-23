import { jsonApiError } from "@/lib/api-error-response";
import { defaultCurrencyForUiLocale, parseCurrencyCode, toPrismaCurrencyCode } from "@/lib/currency-code";
import { routing } from "@/i18n/routing";
import { getCorporateEmailReject } from "@/lib/is-corporate-email";
import { prisma } from "@/lib/prisma";
import { newRequestId } from "@/lib/server-logger";
import { requestLicenseBodySchema } from "@/lib/validation/api-schemas";
import { zodErrorResponse } from "@/lib/validation/zod-response";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestId = newRequestId();
  let raw: unknown;
  try {
    raw = await request.json();
  } catch (err) {
    return jsonApiError(400, {
      error: "invalid_json",
      message: "Request body must be valid JSON.",
      scope: "api.request-license",
      requestId,
      cause: err,
    });
  }

  const validated = requestLicenseBodySchema.safeParse(raw);
  if (!validated.success) {
    return zodErrorResponse(validated.error);
  }

  const body = validated.data;
  const company = body.company.trim();
  const country = body.country.trim();
  const corporateEmail = body.corporateEmail.trim();
  const uiLocale = body.uiLocale ?? "en";
  const currencyCode = toPrismaCurrencyCode(
    parseCurrencyCode(body.currencyCode) ?? defaultCurrencyForUiLocale(uiLocale),
  );

  const emailReject = getCorporateEmailReject(corporateEmail);
  if (emailReject === "invalid_email") {
    return jsonApiError(400, {
      error: "invalid_email",
      message: "The e-mail address format is not valid.",
      scope: "api.request-license",
      requestId,
    });
  }
  if (emailReject === "consumer_email") {
    return jsonApiError(400, {
      error: "consumer_email",
      message: "Use a corporate e-mail domain; consumer mailboxes are not accepted.",
      scope: "api.request-license",
      requestId,
    });
  }

  try {
    await prisma.licenseRequest.create({
      data: {
        company,
        country,
        corporateEmail,
        currencyCode,
      },
    });
  } catch (err) {
    return jsonApiError(500, {
      error: "persist_failed",
      message: "Could not persist the license request.",
      scope: "api.request-license",
      requestId,
      cause: err,
    });
  }

  for (const loc of routing.locales) {
    revalidatePath(`/${loc}/dashboard`);
  }

  return NextResponse.json({ ok: true, requestId });
}
