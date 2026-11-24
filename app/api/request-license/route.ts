import { jsonApiError } from "@/lib/api-error-response";
import { sanitizeUserInput } from "@/lib/anti-disintermediation/contact-sanitize";
import {
  EXPECTED_LENO_CNPJ,
  isExpectedLenoCnpj,
} from "@/lib/anti-disintermediation/exclusivity-terms";
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

  if (body.acceptExclusivity === false) {
    return jsonApiError(400, {
      error: "exclusivity_required",
      message: "Aceite os termos de exclusividade e comissão da Leno.software.",
      scope: "api.request-license",
      requestId,
    });
  }
  if (body.acknowledgeCnpj != null && body.acknowledgeCnpj.trim() !== "" && !isExpectedLenoCnpj(body.acknowledgeCnpj)) {
    return jsonApiError(400, {
      error: "cnpj_mismatch",
      message: `Confirme o CNPJ da Leno.software (${EXPECTED_LENO_CNPJ}).`,
      scope: "api.request-license",
      requestId,
    });
  }
  if (body.notes) {
    const notesResult = sanitizeUserInput(body.notes, "mask");
    if (!notesResult.sanitized.trim() && notesResult.blocked) {
      return jsonApiError(422, {
        error: "contact_blocked",
        message: "Observações com contatos externos foram bloqueadas.",
        scope: "api.request-license",
        requestId,
      });
    }
  }

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
